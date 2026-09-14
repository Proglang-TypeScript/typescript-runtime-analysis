const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const ts = require('typescript');
const {spawnSync} = require('node:child_process');
const {trace} = require('../packages/runtime-tracer/index.cjs');
const {validate} = require('../packages/trace-schema/index.cjs');
const {synthesize} = require('../packages/relational-signatures/index.cjs');
const fixture = path.resolve(__dirname, '../experiments/relational-signatures');
const dataset = require('../experiments/relational-signatures/dataset.json');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const save = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');

function checkClient(text, client, {native = false} = {}) {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'tra-relational-client-'));
  try {
    fs.writeFileSync(path.join(temporary, 'module.d.ts'), text);
    const filename = path.join(temporary, 'client.ts');
    fs.writeFileSync(filename, client);
    const program = ts.createProgram([filename], {noEmit: true, strict: true, types: [], module: ts.ModuleKind.Node16, moduleResolution: ts.ModuleResolutionKind.Node16});
    const diagnostics = ts.getPreEmitDiagnostics(program).map(error => ({code: error.code, message: ts.flattenDiagnosticMessageText(error.messageText, '\n')}));
    let nativeResult;
    if (native) {
      const result = spawnSync(process.execPath, [path.resolve(__dirname, '../node_modules/typescript-native/bin/tsc'), '--ignoreConfig', '--noEmit', '--strict', '--module', 'Node16', '--moduleResolution', 'Node16', filename], {encoding: 'utf8', timeout: 30000});
      nativeResult = {exit: result.status, diagnostics: result.stdout + result.stderr};
    }
    return {pass: diagnostics.length === 0, diagnostics, ...(nativeResult ? {native: nativeResult} : {})};
  } finally { fs.rmSync(temporary, {recursive: true, force: true}); }
}

function aggregate(directory) {
  const evaluation = read(path.join(directory, 'evaluation.json'));
  const lines = ['configuration,inference_pass,held_out_pass,inference_errors,held_out_errors'];
  for (const row of evaluation.clients) lines.push(`${row.configuration},${Number(row.inference.pass)},${Number(row.heldOut.pass)},${row.inference.diagnostics.length},${row.heldOut.diagnostics.length}`);
  fs.writeFileSync(path.join(directory, 'tables.csv'), lines.join('\n') + '\n');
}

function experiment({directory = path.resolve(__dirname, '../experiments/results/relational')} = {}) {
  fs.mkdirSync(directory, {recursive: true});
  const files = {};
  for (const [role, entry] of [['inference', dataset.inference], ['held-out', dataset.heldOut]]) {
    const output = path.join(directory, `${role}.trace.json`);
    trace(path.join(fixture, entry), {targetRoot: fixture, output, package: dataset.package, version: dataset.version, publicModule: 'module', repository: 'checked-in-first-party-fixture', commit: 'synthetic-v1', evidence: role === 'inference' ? 'README' : 'client', trustedFixture: true, captureInvocations: true});
    files[role] = output + '.invocations.json';
  }
  const inference = validate('invocationTrace', read(files.inference));
  const heldOut = validate('invocationTrace', read(files['held-out']));
  assert.notEqual(inference.provenance.executionId, heldOut.provenance.executionId);
  const results = synthesize([inference], dataset.thresholds);
  save(path.join(directory, 'candidates.json'), results);
  const selected = results.filter(result => result.selected);
  assert.deepEqual(selected.map(row => row.selected).sort(), ['discriminated-overloads', 'element-generic', 'identity-generic']);
  const candidateValidity = results.flatMap(result => result.candidates.map(candidate => ({functionName: result.functionName, kind: candidate.kind, ...checkClient(candidate.text, "import * as api from './module';\n")})));
  assert.ok(candidateValidity.every(row => row.pass), JSON.stringify(candidateValidity.filter(row => !row.pass)));
  const declarations = {};
  for (const configuration of ['component-union', 'observation-overloads', 'relational']) {
    const text = selected.map(result => result.candidates.find(candidate => candidate.kind === (configuration === 'relational' ? result.selected : configuration))?.text || '').join('\n');
    fs.writeFileSync(path.join(directory, `${configuration}.d.ts`), text);
    declarations[configuration] = text;
  }
  fs.writeFileSync(path.join(directory, 'correlated-union.d.ts'), selected.find(row => row.functionName === 'convert').candidates.find(row => row.kind === 'correlated-union').text);
  const inferenceClient = fs.readFileSync(path.join(fixture, 'inference.ts'), 'utf8');
  const heldOutClient = fs.readFileSync(path.join(fixture, 'held-out.ts'), 'utf8');
  const clients = Object.entries(declarations).map(([configuration, text]) => ({configuration, inference: checkClient(text, inferenceClient), heldOut: checkClient(text, heldOutClient, {native: configuration === 'relational'})}));
  const relational = clients.find(row => row.configuration === 'relational');
  assert.equal(relational.inference.pass, true, JSON.stringify(relational.inference));
  assert.equal(relational.heldOut.pass, true, JSON.stringify(relational.heldOut));
  assert.equal(relational.heldOut.native.exit, 0, relational.heldOut.native.diagnostics);
  const rejected = checkClient(declarations.relational, fs.readFileSync(path.join(fixture, 'rejected.ts'), 'utf8'));
  assert.equal(rejected.pass, false);
  const evaluation = {purpose: dataset.purpose, clients, candidateValidity, rejectedClient: rejected, abstentions: results.filter(row => !row.selected).map(row => ({functionName: row.functionName, diagnostics: row.diagnostics})), supportingInvocationCount: inference.invocations.length, heldOutInvocationCount: heldOut.invocations.length, heldOutUsedForSynthesis: false};
  save(path.join(directory, 'evaluation.json'), evaluation);
  const hashes = Object.fromEntries(['module.js', 'inference.js', 'held-out.js', 'inference.ts', 'held-out.ts', 'rejected.ts', 'dataset.json'].map(file => [file, crypto.createHash('sha256').update(fs.readFileSync(path.join(fixture, file))).digest('hex')]));
  save(path.join(directory, 'metadata.json'), {dataset, hashes, node: process.version, compiler: ts.version, nativeCompiler: '7.0.2', sourceRoles: {synthesis: dataset.inference, evaluationOnly: dataset.heldOut}, seed: dataset.seed});
  aggregate(directory);
  return evaluation;
}

if (require.main === module) console.log(JSON.stringify(experiment(), null, 2));
module.exports = {experiment, aggregate, checkClient};
