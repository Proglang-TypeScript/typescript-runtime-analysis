const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const ts = require('typescript');
const Ajv = require('ajv');
const {analyzeSignature, analyzePackage, census, summarize, entryPoints} = require('../packages/generic-api-census/index.cjs');
const {sample, assess} = require('../packages/generic-api-census/review.cjs');
const {aggregate, run, timeLimitHours, extractWorker} = require('../scripts/census.cjs');
const {selectVersion, selector, verifyMetadata} = require('../packages/generic-api-census/availability.cjs');
const {assessRuntime} = require('../packages/generic-api-census/runtime-assessment.cjs');
const {encodeShard, decodeShard} = require('../packages/generic-api-census/shard-codec.cjs');
const classify = text => analyzeSignature(ts.createSourceFile('fixture.d.ts', text, ts.ScriptTarget.Latest, true).statements[0]);
let directory;
test.before(() => {
  directory = fs.mkdtempSync(path.join(os.tmpdir(), 'tra-census-'));
  fs.mkdirSync(path.join(directory, 'types/demo'), {recursive: true});
  fs.writeFileSync(path.join(directory, 'types/demo/package.json'), JSON.stringify({name: '@types/demo', version: '1.0.9999'}));
  fs.writeFileSync(path.join(directory, 'types/demo/public.d.ts'), 'export function id<T>(value: T): T;\n');
  fs.writeFileSync(path.join(directory, 'types/demo/index.d.ts'), `
export {id, id as aliasId} from './public';
declare function hidden<T>(value: T): T;
type Value<A> = A;
type Identity<B> = Value<B>;
export function aliases<T>(value: Identity<T>): T;
export function first<T>(values: readonly T[]): T | undefined;
export function wrap<T>(value: T): T[];
export function choose<T>(left: T, right: T): T;
export function constrained<T extends {tag: string}>(value: T): T;
export function callback<T>(value: T, fn: (arg: T) => T): T;
export function overloaded(value: 'a'): string;
export function overloaded(value: 'b'): number;
export interface Callable<T> { (value: T): T; identity(value: T): T; }
export interface Factory { new<T>(value: T): T; }
export interface IterableAPI<T> { [Symbol.iterator](): Iterator<T>; }
export type CallableAlias<T> = (value: T) => T;
export class Box<T> { constructor(value: T); identity(value: T): T; private secret(value: T): T; protected protectedMethod(value: T): T; }
export type {Box as TypeOnlyBox};
export namespace api { function nested<T>(value: T): T; }
export default function defaultIdentity<T>(value: T): T;
declare global { function globalHelper<T>(value: T): T; }
`);
});
test.after(() => fs.rmSync(directory, {recursive: true, force: true}));
test('polarity counts direct identity, array element and container transport', () => {
  assert.deepEqual(classify('declare function id<T>(value:T):T;').classes, ['identity']);
  assert.ok(classify('declare function first<T>(value:readonly T[]):T | undefined;').classes.includes('container-element'));
  assert.ok(classify('declare function wrap<T>(value:T):ReadonlyArray<T>;').classes.includes('value-to-container'));
  assert.equal(classify('declare function make<T>():T;').bothPolarities, false);
});
test('function boundaries reverse polarity recursively, not by argument/result marginals', () => {
  const callback = classify('declare function run<T>(value:T, fn:(arg:T)=>T):T;');
  assert.ok(callback.classes.includes('higher-order'));
  assert.equal(callback.occurrences.find(row => row.route.includes('function-parameter')).polarity, 'positive');
  assert.equal(callback.occurrences.find(row => row.route.includes('function-result')).polarity, 'negative');
  assert.equal(classify('declare function run<T>(fn:(arg:T)=>void):T;').bothPolarities, false);
  assert.equal(classify('declare function run<T>(fn:(inner:(arg:T)=>void)=>void):T;').bothPolarities, true);
});
test('nested generic shadows do not impersonate the outer variable', () => {
  const result = classify('declare function run<T>(fn:<T>(arg:T)=>T):T;');
  assert.equal(result.bothPolarities, false);
  assert.ok(result.unsupportedReasons.includes('nested-generic-function'));
  assert.equal(classify('declare function run<T>(fn:{<T>(arg:T):T}):T;').bothPolarities, false);
});
test('multi-argument, constraint and discriminated classifications retain their reasons', () => {
  assert.ok(classify('declare function choose<T>(left:T,right:T):T;').classes.includes('multiple-arguments'));
  const constrained = classify('declare function id<T extends {tag:string}>(value:T):T;');
  assert.ok(constrained.classes.includes('constrained-generic'));
  assert.equal(constrained.typeParameters[0].constraint, '{tag:string}');
  assert.ok(classify("declare function branch(value:'a'|'b'):number;").classes.includes('overload-or-discriminated'));
});
test('unknown variance and complex types are unknown, not fabricated bipolar evidence', () => {
  const unknown = classify('declare function get<T>(value:Wrapper<T>):T;');
  assert.equal(unknown.bothPolarities, false);
  assert.ok(unknown.unsupportedReasons.includes('unknown-variance:Wrapper'));
  assert.ok(unknown.occurrences.some(row => row.polarity === 'unknown'));
  assert.equal(classify('declare function get<T>(value:keyof T):T;').bothPolarities, false);
  assert.ok(classify('declare function get<T>(value:T):T extends string ? T : never;').classes.includes('unsupported'));
});
test('container transport classes do not mistake nested callback array positions for outer containers', () => {
  const reducer = classify('declare function reduce<T>(fn:(array:T[])=>T, initial:T):T;');
  assert.ok(reducer.classes.includes('higher-order'));
  assert.ok(!reducer.classes.includes('value-to-container'));
  const invoke = classify('declare function invoke<T>(functions:Array<()=>T>):T;');
  assert.ok(invoke.classes.includes('higher-order'));
  assert.ok(!invoke.classes.includes('container-element'));
  const queue = classify('declare function queue<T>(value:T,callbacks:Array<(element:T)=>void>):void;');
  assert.ok(queue.classes.includes('higher-order'));
  assert.ok(!queue.classes.includes('value-to-container'));
});
test('export extraction includes callable types, public methods, constructors and nested aliases', () => {
  const result = analyzePackage(directory, 'demo');
  assert.equal(result.package.status, 'extracted');
  assert.ok(result.rows.some(row => row.exportPath.join('.') === 'aliases' && row.classes.includes('identity')));
  assert.ok(result.rows.some(row => row.exportPath.join('.') === 'Callable' && row.genericOnlyThroughEnclosing));
  assert.ok(result.rows.some(row => row.exportPath.join('.') === 'CallableAlias' && row.hasTypeParameters));
  assert.ok(result.rows.some(row => row.kind === 'constructor'));
  assert.ok(result.rows.some(row => row.exportPath[0] === 'Factory' && row.kind === 'constructor'));
  assert.ok(result.rows.some(row => row.exportPath.join('.') === 'IterableAPI.[Symbol.iterator]'));
  assert.ok(result.rows.some(row => row.exportPath.join('.') === 'api.nested'));
  assert.ok(result.rows.some(row => row.exportPath.join('.') === 'default'));
  assert.ok(result.rows.some(row => row.exportPath[0] === 'TypeOnlyBox' && row.runtimeBinding === 'type-only'));
  assert.ok(result.rows.filter(row => row.exportPath.join('.') === 'overloaded').every(row => row.overloadCount === 2));
});
test('internal/private/protected/global helpers are excluded and augmentations inventoried', () => {
  const result = analyzePackage(directory, 'demo');
  assert.ok(!result.rows.some(row => /hidden|secret|protectedMethod|globalHelper/.test(row.exportPath.join('.'))));
  assert.ok(result.package.exclusions.some(row => row.reason === 'global-or-module-augmentation'));
});
test('re-exports deduplicate at declaration, export and package levels', () => {
  const result = analyzePackage(directory, 'demo');
  const identity = result.rows.filter(row => ['id', 'aliasId'].includes(row.exportPath.join('.')));
  assert.equal(identity.length, 2);
  assert.equal(new Set(identity.map(row => row.declarationId)).size, 1);
  assert.equal(new Set(identity.map(row => row.exportId)).size, 2);
  const counts = summarize([result.package], result.rows);
  assert.ok(counts.totalExportedCallableDeclarations < counts.exportSignaturePairs);
  assert.equal(counts.packagesWithExports, 1);
  assert.equal(counts.packagesWithBothPolarities, 1);
  assert.equal(counts.verifiedExecutableExports, 0);
});
test('CommonJS export-equals and ambient modules resolve public callable exports', () => {
  fs.mkdirSync(path.join(directory, 'types/commonjs'), {recursive: true});
  fs.writeFileSync(path.join(directory, 'types/commonjs/index.d.ts'), 'declare function identity<T>(value:T):T; export = identity;');
  const commonjs = analyzePackage(directory, 'commonjs');
  assert.equal(commonjs.rows.length, 1);
  assert.deepEqual(commonjs.rows[0].exportPath, []);
  fs.mkdirSync(path.join(directory, 'types/ambient'), {recursive: true});
  fs.writeFileSync(path.join(directory, 'types/ambient/index.d.ts'), '/// <reference path="api.d.ts" />\n');
  fs.writeFileSync(path.join(directory, 'types/ambient/api.d.ts'), "declare module 'ambient' { export function id<T>(value:T):T; }");
  assert.equal(analyzePackage(directory, 'ambient').rows.length, 1);
});
test('unresolved dependencies and unsupported syntax are visible, not silently complete', () => {
  fs.mkdirSync(path.join(directory, 'types/missing'), {recursive: true});
  fs.writeFileSync(path.join(directory, 'types/missing/index.d.ts'), "import {External} from 'not-installed'; export function f<T>(value:External<T>):T;");
  const result = analyzePackage(directory, 'missing');
  assert.equal(result.package.status, 'extracted-with-diagnostics');
  assert.ok(result.package.diagnosticCount > 0);
  assert.equal(result.rows[0].bothPolarities, false);
});
test('sampling is deterministic, stratified and deduplicates aliases before manual review', () => {
  const rows = analyzePackage(directory, 'demo').rows;
  const queue = sample(rows, {size: 2, seed: 0});
  assert.deepEqual(sample([...rows].reverse(), {size: 2, seed: 0}), queue);
  assert.equal(new Set(queue.map(row => row.category)).size, 8);
  assert.ok(queue.every(row => row.status === 'pending'));
  assert.equal(assess(queue, []).pending, queue.length);
  const review = {...queue[0], status: 'ambiguous', reviewer: 'reviewer', notes: 'Requires source context'};
  assert.equal(assess(queue, [review]).ambiguous, 1);
  assert.throws(() => assess(queue, [review, review]), /duplicate/);
  assert.throws(() => assess(queue, [{...review, notes: ''}]), /require/);
});
test('versioned shards reject unknown classes, wrong polarity and missing source coordinates', () => {
  const validate = new Ajv({strict: true}).compile(require('../packages/generic-api-census/schema.json'));
  const shard = {schemaVersion: 1, identity: 'a'.repeat(64), ...analyzePackage(directory, 'demo')};
  assert.equal(validate(shard), true, JSON.stringify(validate.errors));
  assert.equal(validate({...shard, schemaVersion: 2}), false);
  const malformed = structuredClone(shard);
  malformed.rows[0].occurrences[0].polarity = 'maybe';
  assert.equal(validate(malformed), false);
});
test('aggregation streams reproducible tables and leaves user review files untouched', () => {
  const output = path.join(directory, 'results');
  fs.mkdirSync(path.join(output, 'packages'), {recursive: true});
  const result = analyzePackage(directory, 'demo');
  const identity = 'b'.repeat(64);
  fs.writeFileSync(path.join(output, 'run.json'), JSON.stringify({identity, selection: ['demo'], reviewSize: 2, seed: 0, provenance: {scope: 'fixture', pinnedCorpusPackages: 1}, compiler: ts.version}));
  fs.writeFileSync(path.join(output, 'packages/demo.json'), JSON.stringify({schemaVersion: 1, identity, ...result}));
  fs.writeFileSync(path.join(output, 'reviews.json'), 'user-owned');
  const first = aggregate(output);
  const csv = fs.readFileSync(path.join(output, 'declarations.csv'), 'utf8');
  assert.deepEqual(aggregate(output), first);
  assert.equal(fs.readFileSync(path.join(output, 'declarations.csv'), 'utf8'), csv);
  assert.equal(fs.readFileSync(path.join(output, 'reviews.json'), 'utf8'), 'user-owned');
  assert.equal(first.coverage.fullPinnedCorpusSelected, false);
  assert.equal(first.counts.verifiedExecutableExports, 0);
  fs.writeFileSync(path.join(output, 'packages/demo.json'), JSON.stringify(encodeShard({schemaVersion: 1, identity, ...result})));
  assert.deepEqual(aggregate(output), first);
  assert.equal(fs.readFileSync(path.join(output, 'declarations.csv'), 'utf8'), csv);
});
test('package selection rejects nonexistent names and traversal', () => {
  assert.throws(() => census(directory, ['../demo'], {scope: 'fixture'}), /invalid/);
  assert.throws(() => census(directory, ['unknown'], {scope: 'fixture'}), /invalid/);
});
test('runtime metadata selects exact compatible versions without installing or claiming executability', () => {
  assert.equal(selectVersion(['1.2.9', '1.2.10', '1.2.11-beta.1']), '1.2.10');
  assert.equal(selector({runtimePackage: 'demo', declarationVersion: '1.2.9999'}).requested, 'demo@1.2.x');
  assert.throws(() => selector({runtimePackage: 'demo', declarationVersion: null}), /explicit version/);
  assert.throws(() => selector({runtimePackage: '--bad', declarationVersion: '1.0.9999'}), /invalid/);
  assert.throws(() => selector({runtimePackage: 'demo'}, 'latest'), /exact/);
  const record = verifyMetadata({name: 'demo', version: '1.2.10', dist: {tarball: 'https://registry.npmjs.org/demo/-/demo-1.2.10.tgz', integrity: 'sha512-YWJjZA=='}}, 'demo', '1.2.10');
  assert.equal(record.runtimeExecution, 'not-assessed');
  assert.equal(verifyMetadata([{name: 'demo', version: '1.2.10', dist: {tarball: record.tarball, integrity: record.integrity}}], 'demo', '1.2.10').version, '1.2.10');
  assert.throws(() => verifyMetadata([], 'demo', '1.2.10'), /one exact/);
  assert.throws(() => verifyMetadata({...record, version: '1.0.0'}, 'demo', '1.2.10'), /identity/);
});
test('extensionless types and declared subpath entries are included without version-variant duplication', () => {
  fs.mkdirSync(path.join(directory, 'types/subpaths'), {recursive: true});
  fs.writeFileSync(path.join(directory, 'types/subpaths/package.json'), JSON.stringify({types: 'index', exports: {'.': {types: {default: './index.d.ts'}}, './extra': {types: './extra.d.ts'}, './*': {types: './*.d.ts'}}}));
  fs.writeFileSync(path.join(directory, 'types/subpaths/index.d.ts'), 'export function id<T>(value:T):T;');
  fs.writeFileSync(path.join(directory, 'types/subpaths/extra.d.ts'), 'export function wrap<T>(value:T):T[];');
  const result = analyzePackage(directory, 'subpaths');
  assert.equal(result.package.status, 'extracted');
  assert.equal(result.package.entries.length, 2);
  assert.equal(result.rows.length, 2);
  assert.ok(result.rows.some(row => row.moduleSpecifier === 'subpaths/extra'));
  assert.equal(entryPoints({types: 'index', exports: {'.': {types: {default: './index.d.ts'}}}}).length, 1);
});
test('merged export-equals objects retain their actual public property chains', () => {
  fs.mkdirSync(path.join(directory, 'types/merged'), {recursive: true});
  fs.writeFileSync(path.join(directory, 'types/merged/index.d.ts'), 'declare const api: api.API; declare namespace api { interface API {identity<T>(value:T):T;} } export = api;');
  const result = analyzePackage(directory, 'merged');
  assert.ok(result.rows.some(row => row.exportPath.join('.') === 'identity' && row.runtimeBinding === 'value'));
  assert.equal(summarize([result.package], result.rows).totalExportedCallableDeclarations, 1);
});
test('runtime assessments require reviewed matching isolated receipts, never a naked executable flag', () => {
  const output = path.join(directory, 'runtime-evidence');
  fs.mkdirSync(output);
  const candidate = {exportId: 'export-1', package: 'demo', runtimeBinding: 'value'};
  const metadata = {directory: 'demo', status: 'metadata-available', name: 'demo', version: '1.0.0', integrity: 'sha512-test'};
  const catalog = {censusIdentity: 'identity', entries: [metadata]};
  const base = {schemaVersion: 1, censusIdentity: 'identity', records: []};
  assert.equal(assessRuntime([candidate], catalog, base, output).counts['not-assessed'], 1);
  const evidence = ['dependency-lock', 'invocation-recipe', 'execution'].map(kind => {
    const file = kind + '.json';
    fs.writeFileSync(path.join(output, file), JSON.stringify({synthetic: true, kind}));
    return {kind, path: file, sha256: require('../packages/generic-api-census/index.cjs').hash(fs.readFileSync(path.join(output, file)))};
  });
  const record = {exportId: candidate.exportId, status: 'reviewed-loaded-and-exercised', reviewer: 'synthetic-test-reviewer', notes: 'Synthetic protocol test, not a real package execution', package: metadata, isolationProfile: 'run-isolated-v1', runnerExitCode: 0, observedOutcome: 'returned', evidence};
  assert.equal(assessRuntime([candidate], catalog, {...base, records: [record]}, output).verifiedExecutableExports, 1);
  assert.throws(() => assessRuntime([candidate], catalog, {...base, records: [{...record, evidence: []}]}, output), /Missing/);
  assert.throws(() => assessRuntime([candidate], catalog, {...base, records: [{...record, package: {...metadata, version: '2.0.0'}}]}, output), /exact/);
  assert.throws(() => assessRuntime([{...candidate, runtimeBinding: 'type-only'}], catalog, {...base, records: [record]}, output), /Type-only/);
  fs.writeFileSync(path.join(output, 'execution.json'), 'modified');
  assert.throws(() => assessRuntime([candidate], catalog, {...base, records: [record]}, output), /hash mismatch/);
});
test('time limit accepts fractional hours and rejects missing, zero, negative and nonfinite values', () => {
  assert.equal(timeLimitHours(undefined), null);
  assert.equal(timeLimitHours('0.5'), 0.5);
  for (const value of [null, '', ' ', '0', '-1', 'NaN', 'Infinity', '1e308', '--resume']) assert.throws(() => timeLimitHours(value), /finite positive/);
  assert.throws(() => run({arguments: ['--time-limit-hours']}), /finite positive/);
});
test('compact storage preserves every row, shared declaration, overload and export path', () => {
  const shard = {schemaVersion: 1, identity: 'c'.repeat(64), ...analyzePackage(directory, 'demo')};
  const encoded = encodeShard(shard);
  assert.deepEqual(decodeShard(JSON.parse(JSON.stringify(encoded))), shard);
  assert.ok(encoded.templates.length < encoded.references.length);
  assert.deepEqual(decodeShard(shard), shard);
  assert.throws(() => decodeShard({...encoded, storageVersion: 2}), /envelope/);
  assert.throws(() => decodeShard({...encoded, rows: []}), /envelope/);
  assert.throws(() => decodeShard({...encoded, references: [{...encoded.references[0], template: -1}]}), /reference/);
  assert.throws(() => decodeShard({...encoded, references: [{...encoded.references[0], extra: true}]}), /reference/);
  assert.throws(() => decodeShard({...encoded, templates: [{...encoded.templates[0], id: 'override'}]}), /template/);
});
test('missing declared variant preserves primary rows and remains explicit incomplete coverage on resume', context => {
  const name = 'partial';
  fs.mkdirSync(path.join(directory, 'types', name));
  fs.writeFileSync(path.join(directory, 'types', name, 'package.json'), JSON.stringify({exports: {'.': {import: './esm/index.d.ts', default: './index.d.ts'}}}));
  fs.writeFileSync(path.join(directory, 'types', name, 'index.d.ts'), 'export function id<T>(value:T):T;');
  const result = analyzePackage(directory, name);
  assert.equal(result.package.status, 'partial-entry');
  assert.equal(result.rows.length, 1);
  assert.equal(result.package.entryCoverage.extracted, 1);
  assert.equal(result.package.entryCoverage.missing[0].entry, 'types/partial/esm/index.d.ts');
  const output = fs.mkdtempSync(path.join(os.tmpdir(), 'tra-partial-results-'));
  context.after(() => fs.rmSync(output, {recursive: true, force: true}));
  let calls = 0;
  const dependencies = {inspectSnapshot: () => ({scope: 'fixture', availablePackages: [name], pinnedCorpusPackages: 1}), extractWorker: () => {calls++; return {status: 0, data: result};}};
  const runArgs = ['--snapshot', directory, '--out', output];
  const previousExitCode = process.exitCode;
  context.after(() => {process.exitCode = previousExitCode;});
  const summary = run({...dependencies, arguments: runArgs});
  assert.equal(summary.coverage.extractionFailures, 0);
  assert.equal(summary.coverage.incompleteEntryPackages, 1);
  assert.equal(process.exitCode, 1);
  run({...dependencies, arguments: [...runArgs, '--resume']});
  assert.equal(calls, 1);
  const checkpoint = JSON.parse(fs.readFileSync(path.join(output, 'checkpoint.json')));
  assert.deepEqual(checkpoint.incompleteEntries, [name]);
  assert.deepEqual(checkpoint.failures, []);
});
test('recursive namespace aliases stop at their cycle while independent public aliases survive', () => {
  fs.mkdirSync(path.join(directory, 'types/recursive'), {recursive: true});
  fs.writeFileSync(path.join(directory, 'types/recursive/index.d.ts'), 'export namespace api { export function id<T>(value:T):T; export import self = api; } export import other = api;');
  const result = analyzePackage(directory, 'recursive');
  assert.ok(result.rows.some(row => row.exportPath.join('.') === 'api.id'));
  assert.ok(result.rows.some(row => row.exportPath.join('.') === 'other.id'));
  assert.ok(!result.rows.some(row => row.exportPath.includes('self')));
  assert.ok(result.package.exclusions.some(row => row.reason === 'recursive-namespace-alias'));
});
test('same-named ambient exports at equal source offsets remain distinct across module specifiers', () => {
  fs.mkdirSync(path.join(directory, 'types/ambient-collision'), {recursive: true});
  fs.writeFileSync(path.join(directory, 'types/ambient-collision/index.d.ts'), '/// <reference path="first.d.ts" />\n/// <reference path="other.d.ts" />\n');
  fs.writeFileSync(path.join(directory, 'types/ambient-collision/first.d.ts'), 'declare module "first" { export function id<T>(value:T):T; }');
  fs.writeFileSync(path.join(directory, 'types/ambient-collision/other.d.ts'), 'declare module "other" { export function id<T>(value:T):T; }');
  const result = analyzePackage(directory, 'ambient-collision');
  assert.equal(result.rows.length, 2);
  assert.deepEqual(result.rows.map(row => row.moduleSpecifier).sort(), ['first', 'other']);
});
test('file-backed worker extraction retains schema data and cleans temporary output on success and failure', context => {
  const output = fs.mkdtempSync(path.join(os.tmpdir(), 'tra-file-worker-'));
  context.after(() => fs.rmSync(output, {recursive: true, force: true}));
  fs.mkdirSync(path.join(output, 'packages'));
  const result = extractWorker(directory, 'demo', output);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.data, analyzePackage(directory, 'demo'));
  assert.equal(fs.existsSync(path.join(output, 'packages/demo.worker.json')), false);
  const failed = extractWorker(directory, 'demo', path.join(output, 'missing'));
  assert.notEqual(failed.status, 0);
  assert.equal(fs.existsSync(path.join(output, 'packages/demo.worker.json')), false);
});
test('timed census saves a complete shard, then resumes with a different budget and identical final results', context => {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'tra-timed-'));
  context.after(() => fs.rmSync(workspace, {recursive: true, force: true}));
  const output = path.join(workspace, 'timed-results');
  const uninterrupted = path.join(workspace, 'uninterrupted-results');
  const selection = ['commonjs', 'demo'];
  const provenance = {scope: 'fixture', availablePackages: selection, pinnedCorpusPackages: 2};
  let elapsed = 0;
  const extracted = [];
  const dependencies = {inspectSnapshot: () => provenance, now: () => elapsed, extractWorker: (root, name) => {
    extracted.push(name);
    elapsed += 3600000;
    return {status: 0, stdout: JSON.stringify(analyzePackage(root, name))};
  }};
  const argumentsFor = target => ['--snapshot', directory, '--out', target, '--packages', selection.join(','), '--review-size', '2'];
  const paused = run({...dependencies, arguments: [...argumentsFor(output), '--time-limit-hours', '0.5']});
  assert.equal(paused.state, 'time-limit-reached');
  assert.deepEqual(paused.successful, ['commonjs']);
  assert.deepEqual(paused.pending, ['demo']);
  assert.deepEqual(extracted, ['commonjs']);
  assert.equal(fs.existsSync(path.join(output, 'summary.json')), false);
  const saved = fs.readFileSync(path.join(output, 'packages/commonjs.json'), 'utf8');
  assert.equal(fs.existsSync(path.join(output, 'packages/commonjs.json.tmp')), false);
  fs.writeFileSync(path.join(output, 'reviews.json'), 'user-owned');
  assert.throws(() => run({...dependencies, arguments: argumentsFor(output)}), /resume/);
  const changedReviewSize = argumentsFor(output);
  changedReviewSize[changedReviewSize.indexOf('--review-size') + 1] = '3';
  assert.throws(() => run({...dependencies, arguments: [...changedReviewSize, '--resume']}), /exact census/);
  const stale = decodeShard(JSON.parse(saved));
  stale.identity = '0'.repeat(64);
  fs.writeFileSync(path.join(output, 'packages/commonjs.json'), JSON.stringify(stale));
  assert.throws(() => run({...dependencies, arguments: [...argumentsFor(output), '--resume']}), /stale census shard/);
  fs.writeFileSync(path.join(output, 'packages/commonjs.json'), saved);
  const resumed = run({...dependencies, arguments: [...argumentsFor(output), '--time-limit-hours', '0.25', '--resume']});
  assert.deepEqual(extracted, ['commonjs', 'demo']);
  assert.equal(fs.readFileSync(path.join(output, 'packages/commonjs.json'), 'utf8'), saved);
  assert.equal(fs.readFileSync(path.join(output, 'reviews.json'), 'utf8'), 'user-owned');
  const progress = JSON.parse(fs.readFileSync(path.join(output, 'checkpoint.json')));
  assert.equal(progress.state, 'extraction-complete');
  assert.equal(progress.timeLimitHours, 0.25);
  assert.deepEqual(progress.pending, []);
  assert.deepEqual(run({...dependencies, arguments: argumentsFor(uninterrupted)}), resumed);
  assert.equal(fs.readFileSync(path.join(output, 'declarations.csv'), 'utf8'), fs.readFileSync(path.join(uninterrupted, 'declarations.csv'), 'utf8'));
});
test('timed failures are retained and retried on resume rather than counted as successful checkpoints', context => {
  const output = fs.mkdtempSync(path.join(os.tmpdir(), 'tra-timed-failures-'));
  context.after(() => fs.rmSync(output, {recursive: true, force: true}));
  const provenance = {scope: 'fixture', availablePackages: ['commonjs', 'demo'], pinnedCorpusPackages: 2};
  let elapsed = 0;
  const argumentsFor = ['--snapshot', directory, '--out', output];
  try {
    const paused = run({arguments: [...argumentsFor, '--time-limit-hours', '1'], inspectSnapshot: () => provenance, now: () => elapsed, extractWorker: () => {elapsed += 3600000; return {status: 1, stderr: 'synthetic failure'};}});
    assert.deepEqual(paused.failures, ['commonjs']);
    assert.equal(process.exitCode, 1);
    process.exitCode = 0;
    const extracted = [];
    const completed = run({arguments: [...argumentsFor, '--resume'], inspectSnapshot: () => provenance, extractWorker: (root, name) => {extracted.push(name); return {status: 0, stdout: JSON.stringify(analyzePackage(root, name))};}});
    assert.deepEqual(extracted, ['commonjs', 'demo']);
    assert.equal(completed.coverage.extractionFailures, 0);
  } finally {process.exitCode = 0;}
});
