const fs = require('node:fs');
const path = require('node:path');
const {smoke} = require('./smoke.cjs');
const {trace} = require('../packages/runtime-tracer/index.cjs');
const {generate} = require('../packages/declaration-generator/index.cjs');
const {merge} = require('../packages/trace-schema/index.cjs');
const {extract, match, distributions, predict} = require('../packages/pattern-analysis/index.cjs');
const dataset = require('../experiments/dataset.json');
const directory = path.resolve(__dirname, '../experiments/results');
fs.mkdirSync(directory, {recursive: true});
const save = (name, value) => fs.writeFileSync(path.join(directory, name), JSON.stringify(value, null, 2) + '\n');
const demonstration = smoke({directory: path.join(directory, 'evidence')});
const files = {README: path.join(directory, 'evidence/README.trace.json'), test: path.join(directory, 'evidence/test.trace.json')};
const traces = Object.fromEntries(Object.entries(files).map(([name, file]) => [name, JSON.parse(fs.readFileSync(file, 'utf8'))]));
const evidence = [];
for (const [configuration, selected, publicOnly] of [['README-only', ['README'], false], ['tests-only', ['test'], false],
  ['union', ['README', 'test'], false], ['filtered-union', ['README', 'test'], true]]) {
  const result = generate(selected.map(name => files[name]), {moduleName: 'module', publicOnly, output: path.join(directory, configuration, 'module/index.d.ts')});
  const observations = merge(selected.map(name => traces[name]), {publicOnly});
  evidence.push({configuration, observations: observations.length, publicFunctions: new Set(observations.filter(row => row.public).map(row => row.functionId)).size,
    internalFunctions: new Set(observations.filter(row => !row.public).map(row => row.functionId)).size, diagnostics: result.diagnostics.length});
}
const records = [];
const packages = new Set();
for (const metadata of dataset.packages) {
  if (packages.has(metadata.name)) throw new Error('Dataset package occurs in several splits');
  packages.add(metadata.name);
  const source = path.join(directory, 'packages', metadata.name);
  fs.mkdirSync(source, {recursive: true});
  fs.writeFileSync(path.join(source, 'module.js'), `function calculate(left, right) { ${metadata.body} }\nmodule.exports = calculate;\n`);
  fs.writeFileSync(path.join(source, 'client.js'), `var calculate = require('./module');\n${metadata.calls.map(args => `calculate(${args.map(value => JSON.stringify(value)).join(', ')});`).join('\n')}\n`);
  const observed = trace(path.join(source, 'client.js'), {targetRoot: source, package: metadata.name, version: metadata.version, trustedFixture: true,
    output: path.join(source, 'trace.json')});
  records.push(...match(extract(path.join(source, 'module.js'), {packageName: metadata.name}), observed).map(row => ({...row, split: metadata.split})));
}
save('raw-pattern-records.json', records);
save('type-distributions.json', distributions(records));
const training = records.filter(row => row.split === 'train');
const validation = predict(training, records.filter(row => row.split === 'validation'));
const evaluation = predict(training, records.filter(row => row.split === 'test'));
save('validation.json', validation);
save('evaluation.json', evaluation);
save('metadata.json', {purpose: dataset.purpose, seed: dataset.seed, node: process.version, compiler: require('typescript').version,
  thresholds: {minimumSupport: 2, minimumConfidence: 0.6}, dataset, workflows: demonstration.workflows, exclusions: []});
save('evidence-summary.json', evidence);
require('./aggregate.cjs').aggregate(directory);
console.log(JSON.stringify({purpose: dataset.purpose, evidence, patternEvaluation: {total: evaluation.total, answered: evaluation.answered,
  accuracy: evaluation.accuracy, coverage: evaluation.coverage}}, null, 2));
