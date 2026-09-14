const fs = require('node:fs');
const acorn = require('acorn');
const walk = require('acorn-walk');
const {validate} = require('../trace-schema/index.cjs');

function extract(file, {packageName, version = '0.0.0-fixture', fileName = 'module.js'} = {}) {
  const ast = acorn.parse(fs.readFileSync(file, 'utf8'), {ecmaVersion: 'latest', sourceType: 'script', locations: true});
  const patterns = [];
  walk.simple(ast, {
    BinaryExpression(node) {
      const shape = operand => operand.type === 'Literal' ? typeof operand.value : operand.type;
      patterns.push(validate('pattern', {schemaVersion: 1, abstraction: 'binary-shallow-v1', package: packageName || 'fixture', version,
        source: {file: fileName, line: node.loc.start.line, column: node.loc.start.column + 1},
        patternId: `binary:${node.operator}:${shape(node.left)}:${shape(node.right)}`, variables: ['left', 'right'], occurrences: 1, packageCount: 1}));
    },
  });
  return patterns.sort((left, right) => left.source.line - right.source.line || left.source.column - right.source.column || left.patternId.localeCompare(right.patternId));
}

function match(patterns, trace) {
  validate('trace', trace);
  const locations = new Map(patterns.map(pattern => [`${pattern.source.file}:${pattern.source.line}:${pattern.source.column}`, pattern]));
  const records = [];
  for (const operator of trace.operators) {
    const pattern = locations.get(`${operator.source.file}:${operator.source.line}:${operator.source.column}`);
    if (!pattern || pattern.patternId.split(':')[1] !== operator.operator) continue;
    for (const position of ['left', 'right']) records.push({package: trace.provenance.package, version: trace.provenance.version,
      patternId: pattern.patternId, position, type: operator[`${position}Type`], executionId: operator.executionId, source: operator.source});
  }
  return records;
}

function distributions(records) {
  const groups = new Map();
  for (const record of records) {
    const key = `${record.patternId}\0${record.position}`;
    if (!groups.has(key)) groups.set(key, {patternId: record.patternId, position: record.position, counts: {}, packages: new Set(), occurrences: 0});
    const group = groups.get(key);
    group.counts[record.type] = (group.counts[record.type] || 0) + 1;
    group.packages.add(record.package);
    group.occurrences++;
  }
  return [...groups.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([, group]) => validate('distribution', {
    schemaVersion: 1, abstraction: 'binary-shallow-v1', patternId: group.patternId, position: group.position,
    counts: Object.fromEntries(Object.entries(group.counts).sort()), packageCount: group.packages.size, occurrences: group.occurrences,
  }));
}

function predict(training, evaluation, {minimumSupport = 2, minimumConfidence = 0.6} = {}) {
  const trainPackages = new Set(training.map(record => record.package));
  if (evaluation.some(record => trainPackages.has(record.package))) throw new Error('Package leakage between train and evaluation');
  const packageVotes = new Map(training.map(record => [`${record.package}\0${record.patternId}\0${record.position}\0${record.type}`, record]));
  const groups = new Map(distributions([...packageVotes.values()]).map(group => [`${group.patternId}\0${group.position}`, group]));
  let answered = 0;
  let correct = 0;
  const predictions = evaluation.map(record => {
    const group = groups.get(`${record.patternId}\0${record.position}`);
    const winner = group && Object.entries(group.counts).sort(([leftType, left], [rightType, right]) => right - left || leftType.localeCompare(rightType))[0];
    const confidence = winner ? winner[1] / group.occurrences : 0;
    const predicted = group && group.packageCount >= minimumSupport && confidence >= minimumConfidence ? winner[0] : null;
    if (predicted) {answered++; if (predicted === record.type) correct++;}
    return {...record, predicted, confidence, supportPackages: group?.packageCount || 0};
  });
  return {predictions, total: evaluation.length, answered, correct, accuracy: answered ? correct / answered : null,
    coverage: evaluation.length ? answered / evaluation.length : 0};
}

module.exports = {extract, match, distributions, predict};
