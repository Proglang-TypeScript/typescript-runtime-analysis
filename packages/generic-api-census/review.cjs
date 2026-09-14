const {hash, classes} = require('./index.cjs');
function sample(rows, {size = 5, seed = 0} = {}) {
  if (!Number.isInteger(size) || size < 1 || size > 100) throw new Error('Invalid review sample size');
  return classes.flatMap(category => {
    const declarations = new Map();
    for (const row of rows) if (row.classes.includes(category)) {
      const previous = declarations.get(row.declarationId);
      if (!previous || hash(`${seed}:${category}:${row.id}`) < hash(`${seed}:${category}:${previous.id}`)) declarations.set(row.declarationId, row);
    }
    return [...declarations.values()].sort((left, right) => hash(`${seed}:${category}:${left.id}`).localeCompare(hash(`${seed}:${category}:${right.id}`))).slice(0, size).map(row => ({reviewId: hash(`${category}:${row.id}`), candidateId: row.id, declarationId: row.declarationId, category, package: row.package, exportPath: row.exportPath, source: row.source, declaration: row.declaration, occurrences: row.occurrences, unsupportedReasons: row.unsupportedReasons, status: 'pending', reviewer: null, notes: null}));
  });
}
function assess(queue, reviews) {
  const known = new Map(queue.map(row => [row.reviewId, row]));
  const seen = new Set();
  const counts = {pending: queue.length, agree: 0, 'false-classification': 0, ambiguous: 0, excluded: 0};
  for (const review of reviews) {
    if (!known.has(review.reviewId) || seen.has(review.reviewId)) throw new Error('Unknown or duplicate review record');
    if (!['agree', 'false-classification', 'ambiguous', 'excluded'].includes(review.status) || !review.reviewer?.trim() || !review.notes?.trim()) throw new Error('Reviewed records require a classification, reviewer and notes');
    seen.add(review.reviewId);
    counts.pending--;
    counts[review.status]++;
  }
  return counts;
}
module.exports = {sample, assess};
