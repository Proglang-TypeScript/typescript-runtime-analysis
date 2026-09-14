const test = require('node:test');
const assert = require('node:assert/strict');
const {compareReviews, questions} = require('../scripts/census-human-review.cjs');
const queue = {identity: 'test-census', records: [{reviewId: 'item', candidateId: 'candidate', declarationId: 'declaration', category: 'identity'}]};
const review = (name, status = 'agree') => ({identity: queue.identity, reviewQueueSha256: 'queue-hash', reviewerProfile: {name, role: 'human', independentReviewConfirmed: true, conflicts: 'none; synthetic test only', date: '2026-09-14'}, records: [{...queue.records[0], status, reviewer: name, notes: 'Synthetic test of the review protocol, not actual human evidence', answers: Object.fromEntries(Object.keys(questions).map(key => [key, 'Synthetic answer'])), evidence: ['synthetic fixture']}]});
test('human comparison records agreement without claiming identity authentication or proof', () => {
  const result = compareReviews(queue, review('Alice'), review('Bob'), 'queue-hash');
  assert.equal(result.counts.sameVerdict, 1);
  assert.equal(result.parametricityProof, false);
  assert.equal(result.sourceFamilyValidation, 'not-assessed-by-this-comparison');
  assert.equal(result.corpusErrorRateEstimate, null);
  assert.match(result.validationBasis, /cannot authenticate/);
});
test('human disagreement and shared ambiguity remain explicit and unadjudicated', () => {
  assert.equal(compareReviews(queue, review('Alice'), review('Bob', 'ambiguous'), 'queue-hash').counts.disagreements, 1);
  const result = compareReviews(queue, review('Alice', 'ambiguous'), review('Bob', 'ambiguous'), 'queue-hash');
  assert.equal(result.counts.ambiguousOrExcluded, 1);
  assert.equal(result.records[0].adjudication, 'pending');
});
test('human comparison rejects duplicate reviewers, AI profiles and undeclared independence', () => {
  assert.throws(() => compareReviews(queue, review('Alice'), review('alice'), 'queue-hash'), /distinct/);
  for (const change of [{role: 'AI'}, {independentReviewConfirmed: false}, {conflicts: ''}, {date: ''}]) {
    const second = review('Bob');
    Object.assign(second.reviewerProfile, change);
    assert.throws(() => compareReviews(queue, review('Alice'), second, 'queue-hash'), /human reviewers/);
  }
});
test('human comparison rejects changed census, queue and candidate identities', () => {
  for (const change of [{identity: 'wrong'}, {reviewQueueSha256: 'wrong'}]) assert.throws(() => compareReviews(queue, review('Alice'), {...review('Bob'), ...change}, 'queue-hash'), /another census/);
  const second = review('Bob');
  second.records[0].category = 'higher-order';
  assert.throws(() => compareReviews(queue, review('Alice'), second, 'queue-hash'), /altered/);
});
test('human comparison rejects pending, missing, duplicate and incomplete answers', () => {
  assert.throws(() => compareReviews(queue, review('Alice'), review('Bob', 'pending'), 'queue-hash'), /require/);
  for (const transform of [second => {second.records = [];}, second => {second.records.push(second.records[0]);}, second => {second.records[0].answers.Q4 = '';}, second => {second.records[0].evidence = [];}, second => {second.records[0].reviewer = 'Someone else';}]) {
    const second = review('Bob');
    transform(second);
    assert.throws(() => compareReviews(queue, review('Alice'), second, 'queue-hash'));
  }
});
