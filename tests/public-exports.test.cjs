const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {collectPublicExports, matchesPublicModule} = require('../packages/runtime-tracer/public-exports.cjs');
const {trace} = require('../packages/runtime-tracer/index.cjs');
const {generate} = require('../packages/declaration-generator/index.cjs');

test('public module matching is exact, not any successful require', () => {
  assert.equal(matchesPublicModule('./module', 'module'), true);
  assert.equal(matchesPublicModule('module', 'module'), false);
  assert.equal(matchesPublicModule('./module.js', 'module'), true);
  for (const name of ['./internal', './nested/module', '../module', 'other-module', null]) assert.equal(matchesPublicModule(name, 'module'), false);
});

test('descriptor inventory retains aliases and nonenumerable own paths without evaluating getters or prototypes', () => {
  const fn = value => value;
  const root = {first: fn, nested: {second: fn}};
  root.cycle = root;
  Object.defineProperty(root, 'hidden', {value: fn});
  Object.defineProperty(root, 'unsafe', {get() { throw new Error('Getter was executed'); }});
  Object.setPrototypeOf(root, {inherited: fn});
  const ids = new WeakMap();
  const result = collectPublicExports(root, value => {if (!ids.has(value)) ids.set(value, 'fn'); return ids.get(value);});
  assert.deepEqual(result.pathsByFunctionId.fn, [['first'], ['nested', 'second'], ['hidden']]);
  assert.ok(result.exclusions.some(item => item.reason === 'cyclic-export-object'));
  assert.ok(result.exclusions.some(item => item.reason === 'accessor-export-not-inspected' && item.path.join('.') === 'unsafe'));
  assert.ok(!result.pathsByFunctionId.fn.some(route => route.includes('inherited')));
});

test('export inventory handles direct callable/static paths and bounds deep/proxy/symbol cases', () => {
  function api(value) {return value;}
  api.helper = function helper(value) {return value;};
  const direct = collectPublicExports(api, value => value.name);
  assert.deepEqual(direct.pathsByFunctionId.api, [[]]);
  assert.deepEqual(direct.pathsByFunctionId.helper, [['helper']]);
  assert.ok(direct.exclusions.some(item => item.reason === 'prototype-members-not-direct-exports'));
  const inaccessible = new Proxy({}, {ownKeys() {throw new Error('Do not inspect proxy');}});
  assert.ok(collectPublicExports(inaccessible, () => 'unused').exclusions.some(item => item.reason === 'export-descriptor-inspection-failed'));
  const symbol = {[Symbol('symbol-export')]: api};
  assert.ok(collectPublicExports(symbol, value => value.name).exclusions.some(item => item.reason === 'symbol-export-not-supported'));
  const deep = {a: {b: {c: {d: api}}}};
  assert.ok(collectPublicExports(deep, value => value.name).exclusions.some(item => item.reason === 'export-depth-budget'));
});

test('instrumented public audit distinguishes object aliases/reexports from internal requires and keeps getters opaque', context => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'tra-public-audit-'));
  context.after(() => fs.rmSync(directory, {recursive: true, force: true}));
  fs.writeFileSync(path.join(directory, 'implementation.js'), 'exports.calculate = function calculate(value) {return value + 1;};\n');
  fs.writeFileSync(path.join(directory, 'internal.js'), 'module.exports = function privateHelper(value) {return value * 2;};\n');
  fs.writeFileSync(path.join(directory, 'module.js'), "const {calculate} = require('./implementation');\nconst api = {calculate, alias: calculate, nested: {calculate}};\napi.self = api;\nObject.defineProperty(api, 'getterOnly', {enumerable:true,get(){throw Error('getter executed');}});\nmodule.exports = api;\n");
  fs.writeFileSync(path.join(directory, 'client.js'), "const api=require('./module');const privateHelper=require('./internal');api.calculate(1);api.alias(2);api.nested.calculate(3);privateHelper(4);\n");
  const file = path.join(directory, 'trace.json');
  const envelope = trace(path.join(directory, 'client.js'), {targetRoot: directory, publicModule: 'module', output: file, trustedFixture: true, captureInvocations: true});
  const publicRows = envelope.observations.filter(row => row.functionName === 'calculate');
  assert.ok(publicRows.length > 0);
  assert.ok(publicRows.every(row => row.public && row.exportPaths.some(route => route.join('.') === 'calculate') && row.exportPaths.some(route => route.join('.') === 'alias') && row.exportPaths.some(route => route.join('.') === 'nested.calculate')));
  assert.ok(envelope.observations.some(row => row.functionName === 'privateHelper' && !row.public && !row.exportPaths.length));
  const sidecar = JSON.parse(fs.readFileSync(file + '.public-exports.json'));
  assert.equal(sidecar.policy, 'commonjs-own-descriptor-v1');
  assert.deepEqual(sidecar.matchedRequires, ['./module']);
  assert.ok(sidecar.exclusions.some(item => item.reason === 'accessor-export-not-inspected' && item.path.join('.') === 'getterOnly'));
  assert.ok(sidecar.exclusions.some(item => item.reason === 'cyclic-export-object'));
  assert.ok(sidecar.entries.some(item => item.paths.some(route => route.join('.') === 'alias')));
  const invocations = JSON.parse(fs.readFileSync(file + '.invocations.json'));
  assert.ok(invocations.invocations.some(item => item.functionName === 'calculate' && item.public && item.exportPaths.some(route => route.join('.') === 'alias')));
  assert.ok(invocations.invocations.some(item => item.functionName === 'privateHelper' && !item.public));
  const generated = generate([file], {moduleName: 'module', publicOnly: true});
  assert.equal(generated.text, '');
  assert.ok(generated.diagnostics.some(item => item.code === 'UNSUPPORTED_PUBLIC_EXPORT_PATH' && item.message.includes('alias')));
  assert.ok(generated.diagnostics.some(item => item.code === 'FILTERED_INTERNAL_API' && item.message.includes('privateHelper')));
});

test('direct callable remains supported while unrelated callable is filtered from declaration generation', context => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'tra-direct-public-'));
  context.after(() => fs.rmSync(directory, {recursive: true, force: true}));
  fs.writeFileSync(path.join(directory, 'module.js'), 'module.exports=function calculate(value){return value+1;};\n');
  fs.writeFileSync(path.join(directory, 'internal.js'), 'module.exports=function privateHelper(value){return value*2;};\n');
  fs.writeFileSync(path.join(directory, 'client.js'), "const calculate=require('./module');const privateHelper=require('./internal');calculate(2);privateHelper(3);\n");
  const file = path.join(directory, 'trace.json');
  const envelope = trace(path.join(directory, 'client.js'), {targetRoot: directory, publicModule: 'module', output: file, trustedFixture: true});
  assert.ok(envelope.observations.some(row => row.functionName === 'calculate' && row.public && row.exportPaths.some(route => route.length === 0)));
  assert.ok(envelope.observations.some(row => row.functionName === 'privateHelper' && !row.public));
  const generated = generate([file], {moduleName: 'module', publicOnly: true});
  assert.match(generated.text, /export = Module;/);
  assert.match(generated.text, /number/);
  assert.doesNotMatch(generated.text, /privateHelper/);
});

test('exported constructor is direct, but instance prototype methods are not misreported as direct exports', context => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'tra-public-class-'));
  context.after(() => fs.rmSync(directory, {recursive: true, force: true}));
  fs.writeFileSync(path.join(directory, 'module.js'), 'class Box {constructor(value){this.value=value;} get(){return this.value;} static make(value){return new Box(value);}} module.exports=Box;\n');
  fs.writeFileSync(path.join(directory, 'client.js'), "const Box=require('./module');new Box(1).get();Box.make(2);\n");
  const file = path.join(directory, 'trace.json');
  const envelope = trace(path.join(directory, 'client.js'), {targetRoot: directory, publicModule: 'module', output: file, trustedFixture: true});
  assert.ok(envelope.observations.some(row => row.functionName === 'Box' && row.public && row.exportPaths.some(route => route.length === 0)));
  assert.ok(envelope.observations.some(row => row.functionName === 'get' && !row.public));
  const sidecar = JSON.parse(fs.readFileSync(file + '.public-exports.json'));
  assert.ok(sidecar.exclusions.some(item => item.reason === 'prototype-members-not-direct-exports'));
});
