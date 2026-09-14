const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const ts = require('typescript');
const Ajv = require('ajv');
const {analyzeSignature, analyzePackage, census, summarize, entryPoints} = require('../packages/generic-api-census/index.cjs');
const {sample, assess} = require('../packages/generic-api-census/review.cjs');
const {aggregate} = require('../scripts/census.cjs');
const {selectVersion, selector, verifyMetadata} = require('../packages/generic-api-census/availability.cjs');
const {assessRuntime} = require('../packages/generic-api-census/runtime-assessment.cjs');
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
