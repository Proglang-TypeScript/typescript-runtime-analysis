const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const {instantiate, TrialFault} = require('../packages/sealing/index.cjs');
const {trial, inputs} = require('../packages/sealing/trials.cjs');
const {propose, challenge, refine, verdict} = require('../packages/sealing/proposals.cjs');
const {trace} = require('../packages/runtime-tracer/index.cjs');
const {validate} = require('../packages/trace-schema/index.cjs');
const fixture = path.resolve(__dirname, '../experiments/sealing');
const variable = {kind: 'variable', name: 'T'};
const contract = {variables: {T: null}, parameters: [variable], result: variable};
const plan = input => ({contract, bindings: {T: input.family}, inputs: [input]});
const run = (name, input = inputs()[0], options = {}) => trial(path.join(fixture, 'module.js'), name, plan(input), {trustedFixture: true, ...options});
let directory;
let candidates;
test.before(() => {
  directory = fs.mkdtempSync(path.join(os.tmpdir(), 'tra-sealing-tests-'));
  const output = path.join(directory, 'trace.json');
  trace(path.join(fixture, 'inference.js'), {targetRoot: fixture, output, publicModule: 'module', captureInvocations: true, trustedFixture: true});
  candidates = propose(JSON.parse(fs.readFileSync(output + '.invocations.json', 'utf8')));
});
test.after(() => { if (directory) fs.rmSync(directory, {recursive: true, force: true}); });

test('fresh brands cannot be forged, reused across trials or confused across variables', () => {
  const first = instantiate(contract, {T: 'number'});
  const second = instantiate(contract, {T: 'number'});
  assert.notEqual(first.trialId, second.trialId);
  const token = first.monitor(variable, 1, 'negative', 'argument:0');
  assert.throws(() => second.monitor(variable, token, 'positive', 'result'), error => error instanceof TrialFault && error.kind === 'seal-violation');
  assert.throws(() => first.monitor(variable, {brand: 'T'}, 'positive', 'result'), /MISSING_OR_WRONG_SEAL/);
  const mixed = instantiate({...contract, variables: {T: null, U: null}}, {T: 'number', U: 'number'});
  assert.throws(() => mixed.monitor({kind: 'variable', name: 'U'}, mixed.monitor(variable, 2, 'negative', 'input'), 'positive', 'result'), /MISSING_OR_WRONG_SEAL/);
  assert.throws(() => first.monitor({kind: 'container'}, [], 'negative', 'input'), error => error.kind === 'inconclusive' && error.code === 'UNSUPPORTED_TYPE_TERM');
});

test('negative occurrences seal and positive occurrences check/unseal the exact payload', () => {
  for (const input of [{family: 'number', value: 1}, {family: 'object', value: {fresh: true}}]) {
    const session = instantiate(contract, {T: input.family});
    const token = session.monitor(variable, input.value, 'negative', 'argument:0');
    assert.equal(session.monitor(variable, token, 'positive', 'result'), input.value);
    assert.deepEqual(session.events.map(event => event.polarity), ['negative', 'positive']);
  }
});

test('callback and returned-function boundaries reverse parameter polarity', () => {
  const session = instantiate(contract, {T: 'number'});
  const fnType = {kind: 'function', parameters: [variable], result: variable};
  const callback = session.monitor(fnType, value => {assert.equal(typeof value, 'number'); return value;}, 'negative', 'callback');
  const token = session.monitor(variable, 7, 'negative', 'input');
  assert.equal(session.monitor(variable, callback(token), 'positive', 'result'), 7);
  assert.ok(session.events.some(event => event.path === 'callback.argument:0' && event.polarity === 'positive'));
  assert.ok(session.events.some(event => event.path === 'callback.result' && event.polarity === 'negative'));
  const returned = session.monitor(fnType, value => value, 'positive', 'returned');
  assert.equal(returned(8), 8);
});

test('real parametric identity transports a fresh seal and coincidental identity violates it', () => {
  assert.equal(run('identity').status, 'passed');
  const rejected = run('nonParametric');
  assert.equal(rejected.status, 'seal-violation');
  assert.equal(rejected.code, 'MISSING_OR_WRONG_SEAL');
  assert.equal(rejected.concreteOutcome.status, 'return');
});

test('diverse challenges cover primitive/container families with distinct fresh trials', () => {
  const proposed = candidates.find(candidate => candidate.functionName === 'identity');
  const result = challenge(path.join(fixture, 'module.js'), proposed, {trustedFixture: true});
  assert.equal(result.verdict, 'validated-on-supported-trials');
  assert.equal(new Set(result.trials.map(row => row.result.trialId)).size, inputs().length);
  assert.ok(result.trials.some(row => row.input.family === 'undefined'));
  assert.ok(result.trials.some(row => row.input.family === 'array'));
});

test('typeof, coercion, equality, identity, serialization and native/reflection interactions are inconclusive', () => {
  for (const name of ['inspectType', 'coerce', 'equal', 'objectIdentity', 'serialize', 'native', 'reflect']) assert.equal(run(name).status, 'inconclusive', name);
});

test('primitive wrapping is not blamed as an opaque object-field violation', () => {
  assert.equal(run('tagIdentity').status, 'inconclusive');
  assert.equal(run('tagIdentity', {family: 'object', value: {tag: 'a'}}).status, 'seal-violation');
});

test('ordinary exceptions, actual worker timeouts and harness failures are distinct', () => {
  assert.equal(run('ordinaryException').status, 'exception');
  assert.equal(trial(path.join(fixture, 'timeout.cjs'), 'identity', plan(inputs()[0]), {trustedFixture: true, timeoutMs: 150}).status, 'timeout');
  assert.equal(run('missingExport').status, 'harness-failure');
  assert.throws(() => trial(path.join(fixture, 'module.js'), 'identity', plan(inputs()[0])), /require isolation/);
});

test('caught unsupported interactions and caught violations cannot produce passing evidence', () => {
  assert.equal(run('swallowCoercion').status, 'inconclusive');
  assert.equal(run('swallowPeek', {family: 'object', value: {tag: 'a'}}).status, 'seal-violation');
});

test('proposing observations retain the misleading correlation without leaking validation evidence', () => {
  const proposed = candidates.find(candidate => candidate.functionName === 'nonParametric');
  assert.equal(proposed.proposingInvocations.length, 2);
  assert.ok(proposed.observations.every(row => row.arguments[0].valueId === row.result.valueId));
  assert.equal(challenge(path.join(fixture, 'module.js'), proposed, {trustedFixture: true}).verdict, 'rejected');
});

test('justified constraints are re-challenged and inadmissible constraint inputs are harness failures', () => {
  const rejected = challenge(path.join(fixture, 'module.js'), candidates.find(candidate => candidate.functionName === 'tagIdentity'), {trustedFixture: true});
  const refined = refine(rejected);
  assert.equal(refined.decision, 'constraint');
  assert.match(refined.candidate.text, /T extends \{ tag: string \}/);
  assert.equal(challenge(path.join(fixture, 'module.js'), refined.candidate, {trustedFixture: true}).verdict, 'validated-on-supported-trials');
  const invalid = trial(path.join(fixture, 'module.js'), 'tagIdentity', {contract: refined.candidate.contract, bindings: {T: 'object'}, inputs: [{family: 'object', value: {tag: 1}}]}, {trustedFixture: true});
  assert.equal(invalid.status, 'harness-failure');
});

test('inconclusive trials are not passes or counterexamples and overload fallback is not proof', () => {
  assert.equal(verdict([{result: {status: 'passed'}}, {result: {status: 'inconclusive'}}]), 'inconclusive');
  const result = refine(challenge(path.join(fixture, 'module.js'), candidates.find(candidate => candidate.functionName === 'nonParametric'), {trustedFixture: true}));
  assert.equal(result.decision, 'overloads');
  assert.equal(result.validated, false);
});

test('versioned trial records reject unknown outcomes and missing diagnostics', () => {
  const result = run('identity');
  validate('trial', result);
  assert.throws(() => validate('trial', {...result, status: 'probably-good'}), /trial:/);
  assert.throws(() => validate('trial', {...result, schemaVersion: 2}), /trial:/);
  assert.throws(() => validate('trial', {...result, events: [{kind: 'seal'}]}), /trial:/);
  assert.throws(() => validate('trial', {...result, concreteOutcome: {status: 'maybe'}}), /trial:/);
});

test('CLI sealing executes the same bounded worker and retains classified evidence', () => {
  const input = path.join(directory, 'plan.json');
  const output = path.join(directory, 'result.json');
  fs.writeFileSync(input, JSON.stringify(plan(inputs()[0])));
  const result = spawnSync(process.execPath, [path.resolve(__dirname, '../packages/cli/index.cjs'), 'seal', path.join(fixture, 'module.js'), '--export', 'identity', '--plan', input, '--out', output, '--trusted-fixture'], {encoding: 'utf8', timeout: 30000});
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(fs.readFileSync(output, 'utf8')).status, 'passed');
});
