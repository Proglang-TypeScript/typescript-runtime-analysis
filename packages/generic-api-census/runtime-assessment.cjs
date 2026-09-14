const fs = require('node:fs');
const path = require('node:path');
const {hash} = require('./index.cjs');
const statuses = ['reviewed-loaded-and-exercised', 'load-failed', 'exercise-failed', 'unsupported', 'not-assessed'];
function assessRuntime(rows, catalog, assessment, directory) {
  if (assessment.schemaVersion !== 1 || assessment.censusIdentity !== catalog.censusIdentity) throw new Error('Runtime assessment version/census identity mismatch');
  const exports = new Map(rows.map(row => [row.exportId, row]));
  const entries = new Map(catalog.entries.map(entry => [entry.directory, entry]));
  const seen = new Set();
  const successfulPackages = new Set();
  const counts = Object.fromEntries(statuses.map(status => [status, 0]));
  const root = fs.realpathSync(directory);
  for (const record of assessment.records) {
    const candidate = exports.get(record.exportId);
    if (!candidate || seen.has(record.exportId) || !statuses.includes(record.status)) throw new Error('Unknown/duplicate export or invalid runtime status');
    seen.add(record.exportId);
    if (record.status !== 'not-assessed' && (!record.reviewer?.trim() || !record.notes?.trim())) throw new Error('Runtime evidence requires a reviewer and notes');
    if (record.status === 'reviewed-loaded-and-exercised') {
      const metadata = entries.get(candidate.package);
      if (candidate.runtimeBinding === 'type-only') throw new Error('Type-only declarations are not directly executable runtime exports');
      if (metadata?.status !== 'metadata-available' || record.package?.name !== metadata.name || record.package?.version !== metadata.version || record.package?.integrity !== metadata.integrity) throw new Error('Runtime evidence must match the exact catalogue package/version/integrity');
      if (record.isolationProfile !== 'run-isolated-v1' || record.runnerExitCode !== 0 || record.observedOutcome !== 'returned') throw new Error('Positive assessment requires reviewed successful isolated execution, not a load-only flag');
      const evidence = new Map((record.evidence || []).map(item => [item.kind, item]));
      for (const kind of ['dependency-lock', 'invocation-recipe', 'execution']) if (!evidence.has(kind)) throw new Error('Missing lock, invocation recipe or execution evidence');
    }
    for (const artifact of record.evidence || []) {
      if (!/^[a-f0-9]{64}$/.test(artifact.sha256 || '') || typeof artifact.path !== 'string') throw new Error('Evidence needs a SHA256 and relative path');
      const selected = fs.realpathSync(path.resolve(root, artifact.path));
      const relative = path.relative(root, selected);
      if (path.isAbsolute(artifact.path) || relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative)) throw new Error('Evidence must remain inside the assessment directory');
      if (hash(fs.readFileSync(selected)) !== artifact.sha256) throw new Error('Runtime evidence hash mismatch');
    }
    counts[record.status]++;
    if (record.status === 'reviewed-loaded-and-exercised') successfulPackages.add(record.package.name);
  }
  counts['not-assessed'] += exports.size - seen.size;
  return {schemaVersion: 1, censusIdentity: assessment.censusIdentity, counts, verifiedExecutableExports: counts['reviewed-loaded-and-exercised'], nominalRuntimePackagesWithVerifiedExports: successfulPackages.size, basis: 'Review-attested execution; identity, artifact hashes and catalogue binding checked. Isolation/result claims still require source/receipt inspection, not automatic proof. Package-family independence is not established.'};
}
module.exports = {assessRuntime};
