const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
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
