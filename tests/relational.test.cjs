const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {trace} = require('../packages/runtime-tracer/index.cjs');
const {validate} = require('../packages/trace-schema/index.cjs');
const {synthesize} = require('../packages/relational-signatures/index.cjs');
const {spawnSync} = require('node:child_process');
const fixture = path.resolve(__dirname, '../experiments/relational-signatures');
let temporary;
let inference;
let heldOut;
test.before(() => {
  temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'tra-relational-test-'));
  const capture = entry => {
    const output = path.join(temporary, entry + '.json');
    trace(path.join(fixture, entry), {targetRoot: fixture, output, package: 'relational-test', version: '1.0.0', publicModule: 'module', trustedFixture: true, captureInvocations: true});
    return JSON.parse(fs.readFileSync(output + '.invocations.json', 'utf8'));
  };
  inference = capture('inference.js');
  heldOut = capture('held-out.js');
});
test.after(() => { if (temporary) fs.rmSync(temporary, {recursive: true, force: true}); });
const resultFor = (name, value = inference, options) => synthesize([value], options).find(result => result.functionName === name);
const modify = callback => { const value = structuredClone(inference); callback(value); return value; };

test('real invocations retain argument/result equality and original locations', () => {
  validate('invocationTrace', inference);
  const rows = inference.invocations.filter(row => row.functionName === 'identity');
  assert.equal(rows.length, 2);
  for (const row of rows) {
    assert.equal(row.arguments[0].valueId, row.result.valueId);
    assert.equal(row.source.file, 'module.js');
    assert.equal(row.source.line, 1);
    assert.equal(row.receiver.type, 'object');
  }
  const object = heldOut.invocations.find(row => row.functionName === 'identity' && row.arguments[0].type === 'object');
  assert.equal(object.arguments[0].valueId, object.result.valueId);
});

test('callback tuples and exceptional outcomes remain linked, not flattened', () => {
  const apply = inference.invocations.find(row => row.functionName === 'apply');
  assert.equal(apply.callbacks.length, 1);
  assert.equal(apply.callbacks[0].argumentIndex, 1);
  const callback = inference.invocations.find(row => row.invocationId === apply.callbacks[0].invocationId);
  assert.equal(callback.functionName, 'increment');
  assert.equal(callback.parentInvocationId, apply.invocationId);
  assert.equal(callback.arguments[0].type, 'number');
  assert.equal(callback.result.type, 'number');
  const failed = inference.invocations.find(row => row.functionName === 'fail');
  assert.equal(failed.outcome, 'throw');
  assert.equal(failed.arguments[0].literal, 1);
  assert.equal(failed.result.type, 'object');
  assert.equal(resultFor('apply').selected, null);
  assert.equal(resultFor('fail').selected, null);
});

test('strict invocation schemas reject unknown versions and missing tuple positions', () => {
  assert.throws(() => validate('invocationTrace', {...inference, schemaVersion: 2}), /invocationTrace:/);
  const broken = modify(value => { delete value.invocations[0].result; });
  assert.throws(() => synthesize([broken]), /invocationTrace:/);
  const literal = modify(value => { value.invocations.find(row => row.functionName === 'identity').arguments[0].literal = 'wrong-type'; });
  assert.throws(() => validate('invocationTrace', literal), /invocationTrace:/);
  const link = modify(value => { value.invocations.find(row => row.functionName === 'apply').callbacks[0].invocationId = 'missing'; });
  assert.throws(() => validate('invocationTrace', link), /callback invocation link/);
});

test('synthesis is deterministic, deduplicated and package-version aware', () => {
  assert.deepEqual(synthesize([inference]), synthesize([inference, inference]));
  const reverse = {...inference, invocations: [...inference.invocations].reverse()};
  assert.deepEqual(synthesize([inference]), synthesize([reverse]));
  const otherVersion = {...inference, provenance: {...inference.provenance, version: '2.0.0'}};
  assert.equal(synthesize([inference, otherVersion]).length, synthesize([inference]).length * 2);
});

test('identity and container-element candidates preserve relational positions', () => {
  const identity = resultFor('identity');
  assert.equal(identity.selected, 'identity-generic');
  assert.match(identity.candidates.find(row => row.kind === identity.selected).text, /identity<T>\(arg0: T\): T/);
  const element = resultFor('first');
  assert.equal(element.selected, 'element-generic');
  const candidate = element.candidates.find(row => row.kind === element.selected);
  assert.equal(candidate.relationships[0].kind, 'container-element');
  assert.match(candidate.text, /first<T>\(arg0: T\[\]\): T/);
});

test('same shallow types without value equality do not imply generics', () => {
  const changed = modify(value => {
    for (const row of value.invocations.filter(row => row.functionName === 'identity')) row.result.valueId = 'different-result';
  });
  assert.equal(resultFor('identity', changed).selected, null);
});

test('bounded discriminant branches generate overload and correlated-union candidates', () => {
  const result = resultFor('convert');
  assert.equal(result.selected, 'discriminated-overloads');
  const overload = result.candidates.find(row => row.kind === result.selected);
  assert.match(overload.text, /arg0: "number", arg1: string\): number/);
  assert.match(overload.text, /arg0: "string", arg1: number\): string/);
  assert.equal(overload.supportingInvocations.length, 4);
  assert.ok(result.candidates.some(row => row.kind === 'component-union'));
  assert.ok(result.candidates.some(row => row.kind === 'observation-overloads'));
  assert.match(result.candidates.find(row => row.kind === 'correlated-union').text, /arguments: \["number", string\]; result: number/);
});

test('insufficient evidence and budget overflow abstain without truncating support', () => {
  const one = {...inference, invocations: inference.invocations.filter(row => row.functionName === 'identity').slice(0, 1)};
  assert.equal(resultFor('identity', one).selected, null);
  const bounded = resultFor('convert', inference, {maxInvocations: 2});
  assert.equal(bounded.selected, null);
  assert.deepEqual(bounded.candidates, []);
  assert.match(bounded.diagnostics[0], /budget exceeded/);
  assert.throws(() => synthesize([inference], {minSupport: 1}), /Invalid synthesis bounds/);
});

test('conflicting invocation identities and execution provenance are rejected', () => {
  const broken = modify(value => { value.invocations[0].executionId = 'other-execution'; });
  assert.throws(() => synthesize([broken]), /provenance mismatch/);
  const conflicting = modify(value => { value.invocations.find(row => row.functionName === 'identity').result.valueId = 'changed'; });
  assert.throws(() => synthesize([inference, conflicting]), /Conflicting invocation identity/);
});

test('incomplete containers and inconsistent arity cannot create precise candidates', () => {
  const incomplete = modify(value => {
    for (const row of value.invocations.filter(row => row.functionName === 'first')) row.arguments[0].complete = false;
  });
  assert.equal(resultFor('first', incomplete).selected, null);
  const arity = modify(value => { value.invocations.find(row => row.functionName === 'identity').arguments.push(value.invocations[0].result); });
  assert.equal(resultFor('identity', arity).selected, null);
});

test('relational declarations validate inference and genuinely separate held-out clients', () => {
  const results = synthesize([inference]);
  const text = results.map(row => row.candidates.find(candidate => candidate.kind === row.selected)?.text || '').join('\n');
  const {checkClient} = require('../scripts/relational-experiment.cjs');
  assert.notEqual(inference.provenance.executionId, heldOut.provenance.executionId);
  assert.equal(checkClient(text, fs.readFileSync(path.join(fixture, 'inference.ts'), 'utf8')).pass, true);
  assert.equal(checkClient(text, fs.readFileSync(path.join(fixture, 'held-out.ts'), 'utf8')).pass, true);
  assert.equal(checkClient(text, fs.readFileSync(path.join(fixture, 'rejected.ts'), 'utf8')).pass, false);
  const input = path.join(temporary, 'cli-input.json');
  const output = path.join(temporary, 'cli', 'index.d.ts');
  fs.writeFileSync(input, JSON.stringify(inference));
  const command = spawnSync(process.execPath, [path.resolve(__dirname, '../packages/cli/index.cjs'), 'synthesize', input, '--out', output], {encoding: 'utf8', timeout: 30000});
  assert.equal(command.status, 0, command.stderr);
  assert.equal(checkClient(fs.readFileSync(output, 'utf8'), fs.readFileSync(path.join(fixture, 'held-out.ts'), 'utf8')).pass, true);
  assert.equal(JSON.parse(fs.readFileSync(output + '.diagnostics.json', 'utf8')).length, results.length);
});
