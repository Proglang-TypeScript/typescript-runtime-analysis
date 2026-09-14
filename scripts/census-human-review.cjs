const fs = require('node:fs');
const path = require('node:path');
const {hash} = require('../packages/generic-api-census/index.cjs');
const {decodeShard} = require('../packages/generic-api-census/shard-codec.cjs');
const {assess} = require('../packages/generic-api-census/review.cjs');
const {inspect} = require('./census-snapshot.cjs');
const questions = {
  Q1: 'Does the pinned source and exact declaration location match? What is the unit: declaration, overload, export/signature pair or package?',
  Q2: 'Is the callable publicly reachable? Is this a runtime value, an instance member requiring a receiver, or a type-only callable? Give the actual property chain or mark unresolved.',
  Q3: 'Which type variables are owned by this signature versus enclosing scopes? Are constraints, specialization, rest arguments or overloads relevant?',
  Q4: 'For each relevant variable, trace input/output occurrences and polarity flips at callback boundaries. Are any occurrences unknown? Do the recorded routes match?',
  Q5: 'Does this specific category satisfy the documented bounded rubric? Explain using source positions, not just the presence of a generic name.',
  Q6: 'Could unresolved imports, capped diagnostics, recursive aliases, unsupported syntax or missing entry branches undermine the classification? What needs further checking?',
  Q7: 'Has an exact runtime package/version/import-mode mapping been established? Cite evidence, or explicitly answer not assessed; declaration presence alone is insufficient.',
  Q8: 'Is there a feasible invocation recipe with receiver, setup, argument domain, preconditions, callbacks, async completion and cleanup? Describe it or mark not assessed.',
  Q9: 'What does the evidence NOT establish? Distinguish syntactic classification, finite ordinary execution, seal outcomes and proof of parametricity.',
  Q10: 'Choose agree, false-classification, ambiguous or excluded for this category. Why? State corrections or blockers and confidence.'
};
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const save = (directory, name, value) => fs.writeFileSync(path.join(directory, name), JSON.stringify(value, null, 2) + '\n', {flag: 'wx'});
function prepareReview(directory, snapshot, output) {
  const run = read(path.join(directory, 'run.json'));
  const checkpoint = read(path.join(directory, 'checkpoint.json'));
  const queue = read(path.join(directory, 'review-queue.json'));
  if (checkpoint.identity !== run.identity || queue.identity !== run.identity || checkpoint.state !== 'extraction-complete' || checkpoint.pending.length) throw new Error('Review requires an aggregated, completed extraction with matching identities');
  const provenance = inspect(snapshot);
  if (JSON.stringify(provenance) !== JSON.stringify(run.provenance)) throw new Error('Reviewer source checkout differs from census provenance');
  const root = path.resolve(snapshot);
  const target = path.resolve(output);
  if ([root, path.resolve(directory)].some(input => target === input || target.startsWith(input + path.sep))) throw new Error('Review output must be outside the input checkout and census');
  if (fs.existsSync(target) && fs.readdirSync(target).length) throw new Error('Review output already exists; never overwrite reviewer work');
  const packages = new Map();
  const records = queue.records.map(record => {
    if (!packages.has(record.package)) packages.set(record.package, decodeShard(read(path.join(directory, 'packages', record.package + '.json'))));
    const shard = packages.get(record.package);
    if (shard.identity !== run.identity) throw new Error('Stale reviewer source shard');
    const row = shard.rows.find(candidate => candidate.id === record.candidateId);
    if (!row || row.declarationId !== record.declarationId) throw new Error('Review candidate missing from canonical shard');
    const sourceFile = path.resolve(root, row.source.file);
    if (!sourceFile.startsWith(root + path.sep)) throw new Error('Invalid reviewer source path');
    const sourceSha256 = hash(fs.readFileSync(sourceFile));
    if (sourceSha256 !== shard.package.sourceNotices[row.source.file]?.sha256) throw new Error('Reviewer source hash differs from census');
    const sourceUrl = `https://github.com/DefinitelyTyped/DefinitelyTyped/blob/${run.provenance.commit}/${row.source.file}#L${row.source.line}`;
    return {...record, sourceSha256, sourceUrl, entry: row.entry, moduleSpecifier: row.moduleSpecifier, runtimeBinding: row.runtimeBinding, kind: row.kind, typeParameters: row.typeParameters, contextNote: row.contextNote, entryCoverage: shard.package.entryCoverage, diagnosticCount: shard.package.diagnosticCount, retainedDiagnosticCount: shard.package.retainedDiagnosticCount, answers: Object.fromEntries(Object.keys(questions).map(key => [key, null])), evidence: [], status: 'pending', reviewer: null, notes: null};
  });
  fs.mkdirSync(target, {recursive: true});
  const template = {schemaVersion: 1, identity: run.identity, reviewQueueSha256: hash(fs.readFileSync(path.join(directory, 'review-queue.json'))), reviewerProfile: {name: null, role: 'human', independentReviewConfirmed: null, conflicts: null, date: null}, questions, records};
  save(target, 'reviewer-a.json', template);
  save(target, 'reviewer-b.json', template);
  const worksheet = ['# Independent reviewer worksheet', '', 'Name: ', 'Date: ', 'Affiliation/conflicts: ', 'Independent blind review completed (yes/no): ', 'AI assistance, if any: ', '', `Census identity: ${run.identity}`, `Queue SHA-256: ${template.reviewQueueSha256}`, '', 'Copy this worksheet before editing. Read human-review-guide.md. Preserve your original submission; the maintainer can transcribe prose answers into your JSON worksheet for comparison.', ''];
  for (const record of records) {
    worksheet.push(`## ${record.package}: ${record.exportPath.join('.') || '(module export)'} — ${record.category}`, '', `Review ID: ${record.reviewId}`, `Candidate ID: ${record.candidateId}`, `Source: ${record.sourceUrl}`, `Source SHA-256: ${record.sourceSha256}`, `Binding: ${record.runtimeBinding}; kind: ${record.kind}`, '', '```ts', record.declaration, '```', '');
    for (const [key, question] of Object.entries(questions)) worksheet.push(`### ${key}: ${question}`, '', 'Answer and evidence: ', '');
    worksheet.push('Final verdict (agree / false-classification / ambiguous / excluded): ', 'Confidence (high / medium / low): ', 'Rationale, corrections and unresolved blockers: ', '');
  }
  fs.writeFileSync(path.join(target, 'reviewer-worksheet.md'), worksheet.map(line => line.trimEnd()).join('\n').trimEnd() + '\n', {flag: 'wx'});
  save(target, 'review-pack-manifest.json', {schemaVersion: 1, identity: run.identity, provenance: run.provenance, queueSha256: template.reviewQueueSha256, records: records.length, uniqueDeclarations: new Set(records.map(record => record.declarationId)).size, coverage: read(path.join(directory, 'summary.json')).coverage, independentHumanValidation: 'pending', priorAgentVerdictsIncluded: false});
  fs.copyFileSync(path.resolve(__dirname, '../docs/human-review-guide.md'), path.join(target, 'human-review-guide.md'));
  fs.copyFileSync(path.resolve(__dirname, '../LICENSES/DefinitelyTyped.txt'), path.join(target, 'DefinitelyTyped-LICENSE.txt'));
  return {identity: run.identity, records: records.length, output: target};
}
function compareReviews(queue, first, second, queueSha256) {
  const profiles = [first, second].map(review => review.reviewerProfile);
  if (profiles.some(profile => !profile || profile.role !== 'human' || !profile.name?.trim() || profile.independentReviewConfirmed !== true || !profile.conflicts?.trim() || !profile.date?.trim()) || profiles[0].name.trim().toLowerCase() === profiles[1].name.trim().toLowerCase()) throw new Error('Two distinct self-declared independent human reviewers with conflicts/date are required');
  for (const review of [first, second]) {
    if (review.identity !== queue.identity || review.reviewQueueSha256 !== queueSha256) throw new Error('Human review belongs to another census or queue');
    assess(queue.records, review.records);
    for (const record of review.records) {
      const expected = queue.records.find(item => item.reviewId === record.reviewId);
      if (record.candidateId !== expected.candidateId || record.declarationId !== expected.declarationId || record.category !== expected.category) throw new Error('Human review candidate/category was altered');
    }
    if (review.records.length !== queue.records.length || review.records.some(record => record.reviewer !== review.reviewerProfile.name || Object.keys(questions).some(key => typeof record.answers?.[key] !== 'string' || !record.answers[key].trim()) || !Array.isArray(record.evidence) || !record.evidence.length || record.evidence.some(item => typeof item !== 'string' || !item.trim()))) throw new Error('Each item requires all answers, evidence, matching reviewer name and a final verdict');
  }
  const records = queue.records.map(item => {
    const reviews = [first, second].map(review => review.records.find(record => record.reviewId === item.reviewId));
    return {reviewId: item.reviewId, declarationId: item.declarationId, category: item.category, verdicts: reviews.map(review => review.status), agreement: reviews[0].status === reviews[1].status, notes: reviews.map(review => review.notes), adjudication: 'pending'};
  });
  return {schemaVersion: 1, identity: queue.identity, reviewerProfiles: profiles, validationBasis: 'Self-reported human identity/independence; software cannot authenticate these claims', counts: {records: records.length, sameVerdict: records.filter(record => record.agreement).length, disagreements: records.filter(record => !record.agreement).length, ambiguousOrExcluded: records.filter(record => record.verdicts.some(verdict => ['ambiguous', 'excluded'].includes(verdict))).length}, corpusErrorRateEstimate: null, sourceFamilyValidation: 'not-assessed-by-this-comparison', parametricityProof: false, records};
}
if (require.main === module) {
  const [command, ...args] = process.argv.slice(2);
  const option = name => {const index = args.indexOf('--' + name); if (index < 0 || !args[index + 1] || args[index + 1].startsWith('--')) throw new Error('Missing --' + name); return args[index + 1];};
  try {
    if (command === 'prepare') console.log(JSON.stringify(prepareReview(option('census'), option('snapshot'), option('out')), null, 2));
    else if (command === 'compare') {
      const queueFile = path.join(option('census'), 'review-queue.json');
      const result = compareReviews(read(queueFile), read(option('first')), read(option('second')), hash(fs.readFileSync(queueFile)));
      fs.writeFileSync(option('out'), JSON.stringify(result, null, 2) + '\n', {flag: 'wx'});
      console.log(JSON.stringify(result.counts, null, 2));
    } else throw new Error('Expected prepare or compare');
  } catch (error) {console.error(error.message); process.exitCode = 1;}
}
module.exports = {prepareReview, compareReviews, questions};
