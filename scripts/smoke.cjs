const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');
const {spawnSync} = require('node:child_process');
const {trace} = require('../packages/runtime-tracer/index.cjs');
const {generate} = require('../packages/declaration-generator/index.cjs');
const {extract, match, distributions} = require('../packages/pattern-analysis/index.cjs');
const {examples} = require('./readme.cjs');

function smoke({directory = path.resolve(__dirname, '../work/smoke')} = {}) {
  fs.mkdirSync(directory, {recursive: true});
  const source = path.join(directory, 'source');
  fs.mkdirSync(source, {recursive: true});
  const fixtures = path.resolve(__dirname, '../experiments/fixtures');
  for (const file of ['module.js', 'client.js', 'test.js', 'package.json']) fs.copyFileSync(path.join(fixtures, file), path.join(source, file));
  const example = examples(fs.readFileSync(path.join(fixtures, 'README.md'), 'utf8'))[0];
  assert.ok(example);
  fs.writeFileSync(path.join(source, 'readme.js'), example.code);
  const options = {targetRoot: source, package: 'tra-calculator-fixture', version: '1.0.0', publicModule: 'module', trustedFixture: true};
  const traces = {};
  for (const [evidence, entry] of [['client', 'client.js'], ['README', 'readme.js'], ['test', 'test.js']]) {
    const file = path.join(directory, `${evidence}.trace.json`);
    traces[evidence] = trace(path.join(source, entry), {...options, evidence, output: file});
    assert.ok(traces[evidence].observations.some(observation => observation.public && observation.functionName === 'calculate'));
    generate([file], {moduleName: 'module', output: path.join(directory, evidence, 'module/index.d.ts'), publicOnly: true});
  }
  const output = path.join(directory, 'union/module/index.d.ts');
  const declaration = generate(['README', 'test'].map(evidence => path.join(directory, `${evidence}.trace.json`)), {moduleName: 'module', output, publicOnly: true});
  assert.match(declaration.text, /number/);
  assert.doesNotMatch(declaration.text, /testOnlyCheck/);
  assert.ok(traces.test.observations.some(observation => observation.functionName === 'testOnlyCheck' && !observation.public));
  const client = path.join(directory, 'union/client.ts');
  fs.writeFileSync(client, "import calculate = require('./module');\nconst result: number = calculate(1, 2);\n");
  const compiler = ts.createProgram([client], {noEmit: true, strict: true, types: [], module: ts.ModuleKind.Node16, moduleResolution: ts.ModuleResolutionKind.Node16});
  const errors = ts.getPreEmitDiagnostics(compiler);
  assert.deepEqual(errors.map(error => ts.flattenDiagnosticMessageText(error.messageText, '\n')), []);
  const native = spawnSync(process.execPath, [path.resolve(__dirname, '../node_modules/typescript-native/bin/tsc'), '--ignoreConfig', '--noEmit', '--strict', '--types', 'node', '--module', 'Node16', '--moduleResolution', 'Node16', client], {encoding: 'utf8'});
  assert.equal(native.status, 0, native.stdout + native.stderr);
  assert.deepEqual(require('../packages/declaration-compare/index.cjs').compare(output, output).differences, []);
  const patterns = extract(path.join(source, 'module.js'), {packageName: options.package});
  const records = match(patterns, traces.test);
  assert.ok(records.length >= 2, 'Real source locations must connect static patterns and runtime operands');
  const distribution = distributions(records);
  const repeat = trace(path.join(source, 'test.js'), {...options, evidence: 'test', output: path.join(directory, 'repeat.trace.json')});
  assert.deepEqual(distributions(match(patterns, repeat)), distribution);
  fs.writeFileSync(path.join(directory, 'pattern-distributions.json'), JSON.stringify(distribution, null, 2) + '\n');
  fs.writeFileSync(path.join(directory, 'readme-provenance.json'), JSON.stringify({source: 'experiments/fixtures/README.md', line: example.line, evidence: 'README'}, null, 2) + '\n');
  return {workflows: ['runtime-to-declaration', 'README', 'package-tests', 'static/dynamic-patterns'], compiler: ts.version, nativeCompiler: '7.0.2',
    observations: Object.fromEntries(Object.entries(traces).map(([name, trace]) => [name, trace.observations.length])), distributions: distribution.length};
}

if (require.main === module) console.log(JSON.stringify(smoke(), null, 2));
module.exports = {smoke};
