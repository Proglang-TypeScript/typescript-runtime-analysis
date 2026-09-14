const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const Ajv = require('ajv');
const {analyzePackage, classes, hash} = require('../packages/generic-api-census/index.cjs');
const {sample, assess} = require('../packages/generic-api-census/review.cjs');
const {prepare, inspect} = require('./census-snapshot.cjs');
const {assessRuntime} = require('../packages/generic-api-census/runtime-assessment.cjs');
const validate = new Ajv({allErrors: true, strict: true}).compile(require('../packages/generic-api-census/schema.json'));
const [command = 'run', ...args] = process.argv.slice(2);
const option = (name, fallback) => {const index = args.indexOf('--' + name); return index < 0 ? fallback : args[index + 1];};
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const write = (directory, name, value) => fs.writeFileSync(path.join(directory, name), JSON.stringify(value, null, 2) + '\n');
function implementationHash() {return hash(['../packages/generic-api-census/index.cjs', '../packages/generic-api-census/polarity.cjs', '../packages/generic-api-census/schema.json', '../packages/generic-api-census/review.cjs', 'census.cjs', 'census-snapshot.cjs'].map(name => fs.readFileSync(path.resolve(__dirname, name))).join('\n'));}
function aggregate(directory) {
  const metadata = read(path.join(directory, 'run.json'));
  const sets = new Map();
  const count = (name, key) => {if (!sets.has(name)) sets.set(name, new Set()); sets.get(name).add(key);};
  const packages = [];
  let rowsCount = 0;
  let reviewPool = [];
  const jsonl = fs.openSync(path.join(directory, 'declarations.jsonl'), 'w');
  const csv = fs.openSync(path.join(directory, 'declarations.csv'), 'w');
  const escape = value => '"' + String(value).replaceAll('"', '""') + '"';
  fs.writeSync(csv, 'id,package,export,kind,file,line,generic,both_polarities,classes,runtime_execution\n');
  try {
    for (const name of metadata.selection) {
      const shard = read(path.join(directory, 'packages', name + '.json'));
      if (!validate(shard) || shard.identity !== metadata.identity) throw new Error('Invalid or stale census shard: ' + name);
      packages.push({...shard.package, diagnostics: undefined});
      for (const row of shard.rows) {
        rowsCount++;
        count('totalExportedCallableDeclarations', row.declarationId);
        count('distinctCallableExports', row.exportId);
        count('packagesWithExports', row.package);
        if (row.hasTypeParameters) {count('declarationsWithTypeParameters', row.declarationId); count('packagesWithTypeParameters', row.package);}
        if (row.hasOwnTypeParameters) count('declarationsWithOwnTypeParameters', row.declarationId);
        if (row.bothPolarities) {count('declarationsWithBothPolarities', row.declarationId); count('packagesWithBothPolarities', row.package);}
        if (row.genericOnlyThroughEnclosing) count('genericOnlyThroughEnclosing', row.declarationId);
        if (row.firstOrderPotential) count('firstOrderPotentialDeclarations', row.declarationId);
        for (const category of row.classes) count('class:' + category, row.declarationId);
        fs.writeSync(jsonl, JSON.stringify(row) + '\n');
        fs.writeSync(csv, [row.id, row.package, row.exportPath.join('.'), row.kind, row.source.file, row.source.line, row.hasTypeParameters, row.bothPolarities, row.classes.join('|'), row.runtimeExecution].map(escape).join(',') + '\n');
      }
      reviewPool = sample([...reviewPool, ...shard.rows], {size: metadata.reviewSize, seed: metadata.seed}).map(review => ({...review, id: review.candidateId, classes: [review.category]}));
    }
  } finally {fs.closeSync(jsonl); fs.closeSync(csv);}
  const value = name => sets.get(name)?.size || 0;
  const queue = sample(reviewPool, {size: metadata.reviewSize, seed: metadata.seed});
  write(directory, 'review-queue.json', {schemaVersion: 1, identity: metadata.identity, seed: metadata.seed, perClass: metadata.reviewSize, records: queue});
  const summary = {schemaVersion: 1, identity: metadata.identity, provenance: metadata.provenance, compiler: metadata.compiler, policy: 'declared-entry-module-exports-v1', coverage: {selection: metadata.selection.length, pinnedCorpusPackages: metadata.provenance.pinnedCorpusPackages, fullPinnedCorpusSelected: metadata.provenance.scope === 'full' && metadata.selection.length === metadata.provenance.pinnedCorpusPackages, extractionFailures: packages.filter(row => row.status === 'extraction-failed' || row.status === 'missing-entry').length, compilerDiagnosticPackages: packages.filter(row => row.status === 'extracted-with-diagnostics').length}, counts: {totalExportedCallableDeclarations: value('totalExportedCallableDeclarations'), exportSignaturePairs: rowsCount, distinctCallableExports: value('distinctCallableExports'), declarationsWithTypeParameters: value('declarationsWithTypeParameters'), declarationsWithOwnTypeParameters: value('declarationsWithOwnTypeParameters'), declarationsWithBothPolarities: value('declarationsWithBothPolarities'), packagesWithExports: value('packagesWithExports'), packagesWithTypeParameters: value('packagesWithTypeParameters'), packagesWithBothPolarities: value('packagesWithBothPolarities'), genericOnlyThroughEnclosing: value('genericOnlyThroughEnclosing'), firstOrderPotentialDeclarations: value('firstOrderPotentialDeclarations'), classes: Object.fromEntries(classes.map(name => [name, value('class:' + name)])), obtainableRuntimePackages: 0, verifiedExecutableExports: 0, runtimeAssessment: 'not-assessed'}, manualReview: {pending: queue.length, agree: 0, 'false-classification': 0, ambiguous: 0, excluded: 0}, packages};
  write(directory, 'summary.json', summary);
  fs.writeFileSync(path.join(directory, 'summary.csv'), 'metric,count\n' + Object.entries(summary.counts).filter(([, value]) => typeof value === 'number').map(([name, value]) => `${name},${value}`).join('\n') + '\n' + Object.entries(summary.counts.classes).map(([name, value]) => `${name},${value}`).join('\n') + '\n');
  return summary;
}
function run() {
  const root = path.resolve(option('snapshot', 'work/definitelytyped'));
  const directory = path.resolve(option('out', 'work/census'));
  if (directory === root || directory.startsWith(root + path.sep)) throw new Error('Output must be outside the pinned checkout');
  const provenance = inspect(root);
  const selection = option('packages') ? option('packages').split(',').sort() : provenance.availablePackages;
  if (!selection.length || new Set(selection).size !== selection.length || selection.some(name => !/^[a-z0-9][a-z0-9_.-]*$/.test(name) || !provenance.availablePackages.includes(name))) throw new Error('Invalid package selection');
  const reviewSize = Number(option('review-size', '5'));
  if (!Number.isInteger(reviewSize) || reviewSize < 1 || reviewSize > 100) throw new Error('Invalid review size');
  const compiler = require('typescript').version;
  const identity = hash(JSON.stringify({provenance, selection, compiler, implementation: implementationHash(), reviewSize, seed: 0}));
  if (fs.existsSync(directory) && fs.readdirSync(directory).length) {
    if (!args.includes('--resume') || read(path.join(directory, 'run.json')).identity !== identity) throw new Error('Existing output is not this exact census; use --resume or a fresh directory');
  } else {fs.mkdirSync(path.join(directory, 'packages'), {recursive: true}); write(directory, 'run.json', {schemaVersion: 1, identity, provenance, selection, compiler, implementation: implementationHash(), seed: 0, reviewSize, command: process.argv.slice(2), workerLimits: {heapMb: 1024, timeoutMs: 120000, outputBytes: 64 * 1024 * 1024}});}
  for (const name of selection) {
    const file = path.join(directory, 'packages', name + '.json');
    if (fs.existsSync(file) && read(file).package.status.startsWith('extracted')) continue;
    const result = spawnSync(process.execPath, ['--max-old-space-size=1024', __filename, 'extract', root, name], {encoding: 'utf8', timeout: 120000, maxBuffer: 64 * 1024 * 1024, env: {PATH: process.env.PATH, TZ: 'UTC'}});
    let data;
    try {if (result.status !== 0 || result.error) throw result.error || new Error(result.stderr); data = JSON.parse(result.stdout);}
    catch (error) {data = {package: {directory: name, status: 'extraction-failed', runtimeAvailability: 'not-assessed', runtimeExecution: 'not-assessed', failure: result.error?.code || 'WORKER_FAILURE', diagnostics: [String(error.message).slice(0, 2000)]}, rows: []};}
    write(path.dirname(file), path.basename(file), {schemaVersion: 1, identity, ...data});
    console.error(`${name}: ${data.package.status}; ${data.rows.length} export/signature pairs`);
  }
  inspect(root);
  if (implementationHash() !== read(path.join(directory, 'run.json')).implementation) throw new Error('Census implementation changed during extraction; choose a fresh output directory');
  const summary = aggregate(directory);
  console.log(JSON.stringify({counts: summary.counts, coverage: summary.coverage, manualReview: summary.manualReview}, null, 2));
  if (summary.coverage.extractionFailures) process.exitCode = 1;
}
if (require.main === module) {
  try {
    if (command === 'prepare') console.log(JSON.stringify(prepare(option('out', 'work/definitelytyped'), args.includes('--smoke')), null, 2));
    else if (command === 'run') run();
    else if (command === 'extract') process.stdout.write(JSON.stringify(analyzePackage(args[0], args[1])));
    else if (command === 'aggregate') console.log(JSON.stringify(aggregate(path.resolve(option('out', 'work/census'))).counts, null, 2));
    else if (command === 'review') {
      const directory = path.resolve(option('out', 'work/census'));
      const queue = read(path.join(directory, 'review-queue.json'));
      const reviews = read(option('reviews'));
      if (queue.identity !== reviews.identity) throw new Error('Review set belongs to another census');
      const result = assess(queue.records, reviews.records);
      write(directory, 'review-assessment.json', {schemaVersion: 1, identity: queue.identity, counts: result});
      console.log(JSON.stringify(result, null, 2));
    } else if (command === 'runtime') {
      const directory = path.resolve(option('out', 'work/census'));
      const run = read(path.join(directory, 'run.json'));
      const catalog = read(option('catalog'));
      const file = path.resolve(option('assessment'));
      const assessment = read(file);
      if (catalog.censusIdentity !== run.identity) throw new Error('Catalogue belongs to another census');
      const rows = [];
      for (const name of run.selection) {
        const shard = read(path.join(directory, 'packages', name + '.json'));
        if (!validate(shard) || shard.identity !== run.identity) throw new Error('Invalid/stale runtime-assessment census shard');
        for (const row of shard.rows) rows.push({exportId: row.exportId, package: row.package, runtimeBinding: row.runtimeBinding});
      }
      const result = assessRuntime(rows, catalog, assessment, path.dirname(file));
      write(directory, 'runtime-assessment.json', result);
      console.log(JSON.stringify(result, null, 2));
    } else throw new Error('Expected prepare, run, aggregate, review or runtime');
  } catch (error) {console.error(error.message); process.exitCode = 1;}
}
module.exports = {aggregate, implementationHash};
