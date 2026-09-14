const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const Ajv = require('ajv');
const {analyzePackage, classes, hash} = require('../packages/generic-api-census/index.cjs');
const {sample, assess} = require('../packages/generic-api-census/review.cjs');
const {prepare, inspect} = require('./census-snapshot.cjs');
const {assessRuntime} = require('../packages/generic-api-census/runtime-assessment.cjs');
const {encodeShard, decodeShard} = require('../packages/generic-api-census/shard-codec.cjs');
const validate = new Ajv({allErrors: true, strict: true}).compile(require('../packages/generic-api-census/schema.json'));
const [command = 'run', ...args] = process.argv.slice(2);
const option = (name, fallback) => {const index = args.indexOf('--' + name); return index < 0 ? fallback : args[index + 1];};
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const write = (directory, name, value) => {
  const file = path.join(directory, name);
  const temporary = file + '.tmp';
  fs.writeFileSync(temporary, JSON.stringify(value, null, 2) + '\n');
  fs.renameSync(temporary, file);
};
function timeLimitHours(value) {
  if (value === undefined) return null;
  const hours = Number(value);
  if (typeof value !== 'string' || !value.trim() || !Number.isFinite(hours) || hours <= 0 || !Number.isFinite(hours * 3600000)) throw new Error('--time-limit-hours requires a finite positive number of hours');
  return hours;
}
function implementationHash() {return hash(['../packages/generic-api-census/index.cjs', '../packages/generic-api-census/polarity.cjs', '../packages/generic-api-census/schema.json', '../packages/generic-api-census/review.cjs', '../packages/generic-api-census/shard-codec.cjs', 'census.cjs', 'census-snapshot.cjs'].map(name => fs.readFileSync(path.resolve(__dirname, name))).join('\n'));}
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
      const shard = decodeShard(read(path.join(directory, 'packages', name + '.json')));
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
  summary.coverage.incompleteEntryPackages = packages.filter(row => row.status === 'partial-entry').length;
  summary.coverage.compilerDiagnosticPackages = packages.filter(row => row.diagnosticCount > 0 || row.status === 'extracted-with-diagnostics').length;
  write(directory, 'summary.json', summary);
  fs.writeFileSync(path.join(directory, 'summary.csv'), 'metric,count\n' + Object.entries(summary.counts).filter(([, value]) => typeof value === 'number').map(([name, value]) => `${name},${value}`).join('\n') + '\n' + Object.entries(summary.counts.classes).map(([name, value]) => `${name},${value}`).join('\n') + '\n');
  return summary;
}
function extractWorker(root, name, directory) {
  const file = path.join(directory, 'packages', name + '.worker.json');
  try {
    const result = spawnSync(process.execPath, ['--max-old-space-size=1024', __filename, 'extract', root, name, file], {encoding: 'utf8', timeout: 120000, maxBuffer: 1024 * 1024, env: {PATH: process.env.PATH, TZ: 'UTC'}});
    if (result.status === 0 && !result.error) {
      if (fs.statSync(file).size > 256 * 1024 * 1024) throw new Error('Worker shard exceeds the explicit 256 MB file limit');
      result.data = decodeShard(read(file));
    }
    return result;
  } catch (error) {return {status: 1, error};}
  finally {fs.rmSync(file, {force: true});}
}
function run({arguments: runArgs = args, inspectSnapshot = inspect, extractWorker: worker = extractWorker, now = () => performance.now()} = {}) {
  const started = now();
  const option = (name, fallback) => {const index = runArgs.indexOf('--' + name); return index < 0 ? fallback : runArgs[index + 1];};
  const hours = timeLimitHours(runArgs.includes('--time-limit-hours') ? option('time-limit-hours', null) ?? null : undefined);
  const root = path.resolve(option('snapshot', 'work/definitelytyped'));
  const directory = path.resolve(option('out', 'work/census'));
  if (directory === root || directory.startsWith(root + path.sep)) throw new Error('Output must be outside the pinned checkout');
  const provenance = inspectSnapshot(root);
  const selection = option('packages') ? option('packages').split(',').sort() : provenance.availablePackages;
  if (!selection.length || new Set(selection).size !== selection.length || selection.some(name => !/^[a-z0-9][a-z0-9_.-]*$/.test(name) || !provenance.availablePackages.includes(name))) throw new Error('Invalid package selection');
  const reviewSize = Number(option('review-size', '5'));
  if (!Number.isInteger(reviewSize) || reviewSize < 1 || reviewSize > 100) throw new Error('Invalid review size');
  const compiler = require('typescript').version;
  const identity = hash(JSON.stringify({provenance, selection, compiler, implementation: implementationHash(), reviewSize, seed: 0}));
  if (fs.existsSync(directory) && fs.readdirSync(directory).length) {
    if (!runArgs.includes('--resume') || read(path.join(directory, 'run.json')).identity !== identity) throw new Error('Existing output is not this exact census; use --resume or a fresh directory');
  } else {fs.mkdirSync(path.join(directory, 'packages'), {recursive: true}); write(directory, 'run.json', {schemaVersion: 1, identity, provenance, selection, compiler, implementation: implementationHash(), seed: 0, reviewSize, command: process.argv.slice(2), storage: {version: 1, representation: 'lossless-template-references', logicalSchemaVersion: 1}, workerLimits: {heapMb: 1024, timeoutMs: 120000, outputBytes: 256 * 1024 * 1024, transport: 'temporary-file', logBytes: 1024 * 1024}});}
  const processed = [];
  const successful = [];
  const incompleteEntries = [];
  const failures = [];
  function checkpoint(state) {
    inspectSnapshot(root);
    if (implementationHash() !== read(path.join(directory, 'run.json')).implementation) throw new Error('Census implementation changed during extraction; choose a fresh output directory');
    const progress = {schemaVersion: 1, identity, state, timeLimitHours: hours, elapsedHours: (now() - started) / 3600000, command: ['run', ...runArgs], processed, successful, failures, incompleteEntries, pending: selection.filter(name => !processed.includes(name))};
    write(directory, 'checkpoint.json', progress);
    return progress;
  }
  for (const name of selection) {
    const file = path.join(directory, 'packages', name + '.json');
    const cached = fs.existsSync(file) ? decodeShard(read(file)) : null;
    if (cached && (!validate(cached) || cached.identity !== identity)) throw new Error('Invalid or stale census shard: ' + name);
    let data;
    if (cached?.package.status.startsWith('extracted') || cached?.package.status === 'partial-entry') data = cached;
    else {
      const result = worker(root, name, directory);
      try {if (result.status !== 0 || result.error) throw result.error || new Error(result.stderr); data = result.data || JSON.parse(result.stdout); if (!validate({schemaVersion: 1, identity, ...data})) throw new Error('Invalid worker census shard');}
      catch (error) {data = {package: {directory: name, status: 'extraction-failed', runtimeAvailability: 'not-assessed', runtimeExecution: 'not-assessed', failure: result.error?.code || 'WORKER_FAILURE', diagnostics: [String(error.message).slice(0, 2000)]}, rows: []};}
      write(path.dirname(file), path.basename(file), encodeShard({schemaVersion: 1, identity, ...data}));
      console.error(`${name}: ${data.package.status}; ${data.rows.length} export/signature pairs`);
    }
    processed.push(name);
    (data.package.status === 'partial-entry' ? incompleteEntries : data.package.status.startsWith('extracted') ? successful : failures).push(name);
    if (hours !== null && (now() - started) / 3600000 >= hours && processed.length < selection.length) {
      const progress = checkpoint('time-limit-reached');
      console.log(JSON.stringify(progress, null, 2));
      console.error('Time limit reached at a complete package boundary; resume with the same snapshot/output/selection/review size and --resume. Final aggregation is deferred until all selected packages are processed.');
      if (failures.length || incompleteEntries.length) process.exitCode = 1;
      return progress;
    }
  }
  checkpoint('extraction-complete');
  const summary = aggregate(directory);
  console.log(JSON.stringify({counts: summary.counts, coverage: summary.coverage, manualReview: summary.manualReview}, null, 2));
  if (summary.coverage.extractionFailures || summary.coverage.incompleteEntryPackages) process.exitCode = 1;
  return summary;
}
if (require.main === module) {
  try {
    if (command === 'prepare') console.log(JSON.stringify(prepare(option('out', 'work/definitelytyped'), args.includes('--smoke')), null, 2));
    else if (command === 'run') run();
    else if (command === 'extract') {
      const result = analyzePackage(args[0], args[1]);
      const data = JSON.stringify(args[2] ? encodeShard(result) : result);
      if (args[2]) {
        if (Buffer.byteLength(data) > 256 * 1024 * 1024) throw new Error('Worker shard exceeds the explicit 256 MB file limit');
        fs.writeFileSync(args[2], data);
      } else process.stdout.write(data);
    }
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
        const shard = decodeShard(read(path.join(directory, 'packages', name + '.json')));
        if (!validate(shard) || shard.identity !== run.identity) throw new Error('Invalid/stale runtime-assessment census shard');
        for (const row of shard.rows) rows.push({exportId: row.exportId, package: row.package, runtimeBinding: row.runtimeBinding});
      }
      const result = assessRuntime(rows, catalog, assessment, path.dirname(file));
      write(directory, 'runtime-assessment.json', result);
      console.log(JSON.stringify(result, null, 2));
    } else throw new Error('Expected prepare, run, aggregate, review or runtime');
  } catch (error) {console.error(error.message); process.exitCode = 1;}
}
module.exports = {aggregate, implementationHash, run, timeLimitHours, extractWorker};
