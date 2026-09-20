const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const {harness, loadProfile, testAggregate, testFiles} = require('../scripts/full-suite-lib.cjs');
const {normalizedIncludes, shouldInstrument} = require('../packages/runtime-tracer/instrumentation-filter.cjs');

test('full-suite profiles pin the Mocha and Tape packages', () => {
  const ms = loadProfile('ms-2.1.3');
  const qs = loadProfile('qs-6.15.3');
  assert.equal(ms.framework, 'mocha');
  assert.deepEqual(ms.tests, ['tests.js']);
  assert.deepEqual(ms.instrumentPaths, ['.tra-full-suite.cjs', 'index.js']);
  assert.equal(qs.framework, 'tape');
  assert.deepEqual(qs.tests, ['test/**/*.js']);
  assert.match(ms.image, /^node@sha256:/);
  assert.match(qs.lock.sha256, /^[a-f0-9]{64}$/);
});

test('test selection is sorted, bounded to the package and hashable', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tra-full-suite-'));
  fs.mkdirSync(path.join(root, 'test', 'nested'), {recursive: true});
  fs.mkdirSync(path.join(root, 'node_modules', 'ignored'), {recursive: true});
  fs.writeFileSync(path.join(root, 'test', 'z.js'), 'module.exports = 1;\n');
  fs.writeFileSync(path.join(root, 'test', 'nested', 'a.js'), 'module.exports = 2;\n');
  fs.writeFileSync(path.join(root, 'node_modules', 'ignored', 'x.js'), 'throw new Error();\n');
  try {
    const selected = testFiles(root, ['test/**/*.js', 'node_modules/**/*.js']);
    assert.deepEqual(selected, ['test/nested/a.js', 'test/z.js']);
    assert.match(testAggregate(root, selected), /^[a-f0-9]{64}$/);
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
  }
});

test('framework harnesses load every selected test inside the isolated package', () => {
  const files = ['test/a.js', 'test/b.js'];
  const mocha = harness('mocha', files);
  const tape = harness('tape', files);
  assert.match(mocha, /node_modules\/mocha/);
  assert.match(mocha, /mocha\.run/);
  assert.match(tape, /require\("\/input\/test\/a\.js"\)/);
  assert.match(mocha, /test\/a\.js/);
  assert.match(tape, /test\/b\.js/);
});

test('full-suite filtering instruments the harness and provider but not tests or dependencies', () => {
  const root = path.resolve('/input');
  const includes = normalizedIncludes(['.tra-full-suite.cjs', 'lib/']);
  assert.equal(shouldInstrument(path.join(root, '.tra-full-suite.cjs'), root, includes), true);
  assert.equal(shouldInstrument(path.join(root, 'lib', 'parse.js'), root, includes), true);
  assert.equal(shouldInstrument(path.join(root, 'test', 'parse.js'), root, includes), false);
  assert.equal(shouldInstrument(path.join(root, 'node_modules', 'tape', 'index.js'), root, includes), false);
});

test('repeated calls append argument observations without copying accumulated history', () => {
  const sandbox = {utils: {}, functions: {getTypeOfForReporting: value => typeof value}};
  vm.runInNewContext(fs.readFileSync(path.resolve(__dirname, '../packages/runtime-tracer/utils/functionContainer.js'), 'utf8'), {J$: sandbox});
  const container = new sandbox.utils.FunctionContainer({functionId: 'function-1', name: 'parse'});
  const first = {interactions: [{kind: 'first'}]};
  const second = {interactions: [{kind: 'second'}]};
  assert.equal(container.addArgumentContainer(0, first), first);
  assert.equal(container.addArgumentContainer(0, second), first);
  assert.deepEqual(first.interactions.map(interaction => interaction.kind), ['first', 'second']);
});

test('instrumented function boundaries do not stack proxies', () => {
  const proxyBuilder = {buildProxy: value => new Proxy(value, {get: (target, property) => property === 'IS_WRAPPER_OBJECT' ? true : property === 'TARGET_PROXY' ? target : target[property]})};
  const sandbox = {
    functions: {getTypeOf: value => value === null ? 'null' : typeof value},
    utils: {argumentProxyBuilder: proxyBuilder, argumentWrapperObjectBuilder: {buildFromString: value => value, buildFromNumber: value => value, buildFromUndefined: value => value, buildFromNull: value => value}}
  };
  vm.runInNewContext(fs.readFileSync(path.resolve(__dirname, '../packages/runtime-tracer/utils/wrapperObjectsHandler.js'), 'utf8'), {J$: sandbox});
  const wrapped = sandbox.utils.wrapperObjectsHandler.convertToWrapperObject({value: 1});
  assert.equal(sandbox.utils.wrapperObjectsHandler.convertToWrapperObject(wrapped), wrapped);
});
