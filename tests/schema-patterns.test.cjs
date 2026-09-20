const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {validate, merge} = require('../packages/trace-schema/index.cjs');
const {predict, extract} = require('../packages/pattern-analysis/index.cjs');

test('schema rejects unknown versions, malformed locations and missing provenance', () => {
  assert.throws(() => validate('trace', {schemaVersion: 2}), /trace:/);
  assert.throws(() => validate('source', {file: 'module.js', line: 0, column: 1}), /source:/);
});

test('package-aware baseline rejects leakage and abstains without package support', () => {
  const row = {package: 'train', patternId: 'binary:+:Identifier:Identifier', position: 'left', type: 'number'};
  assert.throws(() => predict([row], [row]), /leakage/);
  assert.equal(predict([row, row], [{...row, package: 'test'}]).answered, 0);
  const result = predict([row, {...row, package: 'train2'}], [{...row, package: 'test'}]);
  assert.equal(result.accuracy, 1);
});

test('pattern extraction is deterministic and retains exact original locations', () => {
  const file = path.resolve(__dirname, '../experiments/fixtures/module.js');
  const patterns = extract(file);
  assert.deepEqual(extract(file), patterns);
  assert.equal(patterns[0].source.line, 2);
  assert.equal(patterns[0].source.column, 10);
});

test('legacy extraction no longer accumulates observations across calls', () => {
  const {walkRec} = require('../dist/pattern-analysis/legacy-visit.js');
  const file = path.resolve(__dirname, '../experiments/fixtures/module.js');
  assert.deepEqual(walkRec({inputFile: file}), walkRec({inputFile: file}));
});

test('trace merge is order-independent, deduplicates exact observations, and filters internal APIs', () => {
  const provenance = {package: 'fixture', version: '1.0.0', repository: 'local', commit: 'fixture', evidence: 'test', entryPoint: 'test.js',
    publicModule: 'module', backend: 'jalangi2', backendVersion: 'pinned', executionId: 'run'};
  const observation = {functionId: 'module:calculate', functionName: 'calculate', position: 'result', index: -1, type: 'number',
    source: {file: 'module.js', line: 1, column: 1}, executionId: 'run', order: 0, public: true, interaction: {kind: 'return'}};
  const publicTrace = {schemaVersion: 1, provenance, observations: [observation], operators: []};
  const internalTrace = {...publicTrace, observations: [{...observation, functionId: 'test:helper', public: false}]};
  assert.deepEqual(merge([publicTrace, internalTrace]), merge([internalTrace, publicTrace]));
  assert.equal(merge([publicTrace, publicTrace, internalTrace]).length, 2);
  assert.deepEqual(merge([publicTrace, internalTrace], {publicOnly: true}), [observation]);
});

test('README extraction retains code and line provenance', () => {
  const {examples} = require('../scripts/readme.cjs');
  assert.deepEqual(examples('intro\n```js\nvar a = 1;\n```\n'), [{code: 'var a = 1;\n', line: 3}]);
});

test('modern syntax passes through the retained Jalangi backend with source maps', () => {
  const {trace} = require('../packages/runtime-tracer/index.cjs');
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'tra-modern-test-'));
  try {
    fs.writeFileSync(path.join(temporary, 'module.js'), 'const calculate = (left, right) => left + right;\nmodule.exports = calculate;\n');
    fs.writeFileSync(path.join(temporary, 'client.js'), "const calculate = require('./module');\nif (calculate(1, 2) !== 3) throw new Error('bad');\n");
    const envelope = trace(path.join(temporary, 'client.js'), {targetRoot: temporary, output: path.join(temporary, 'trace.json'), trustedFixture: true});
    const source = extract(path.join(temporary, 'module.js'))[0].source;
    assert.ok(envelope.operators.some(operator => operator.source.file === source.file && operator.source.line === source.line && operator.source.column === source.column));
  } finally { fs.rmSync(temporary, {recursive: true, force: true}); }
});

test('runtime collection fails explicitly when its observation limit is reached', () => {
  const {trace} = require('../packages/runtime-tracer/index.cjs');
  const fixture = path.resolve(__dirname, '../experiments/fixtures/client.js');
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'tra-limit-test-'));
  try {
    assert.throws(() => trace(fixture, {targetRoot: path.dirname(fixture), output: path.join(temporary, 'trace.json'), trustedFixture: true, maxObservations: 1}), /observation limit exceeded/);
    assert.equal(fs.existsSync(path.join(temporary, 'trace.json')), false);
  } finally { fs.rmSync(temporary, {recursive: true, force: true}); }
});

test('bounded collection can finish while recording deterministic later samples', () => {
  const {trace} = require('../packages/runtime-tracer/index.cjs');
  const fixture = path.resolve(__dirname, '../experiments/fixtures/client.js');
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'tra-truncate-test-'));
  const output = path.join(temporary, 'trace.json');
  try {
    trace(fixture, {targetRoot: path.dirname(fixture), output, trustedFixture: true, maxObservations: 1, truncateObservations: true, sampleEvery: 2});
    const execution = JSON.parse(fs.readFileSync(`${output}.execution.json`, 'utf8'));
    assert.equal(execution.observationBudget.limit, 1);
    assert.equal(execution.observationBudget.truncated, true);
    assert.ok(execution.observationBudget.dropped > 0);
    assert.ok(execution.observationBudget.retained > 1);
  } finally { fs.rmSync(temporary, {recursive: true, force: true}); }
});
