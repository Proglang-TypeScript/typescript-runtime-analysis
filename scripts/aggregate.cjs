const fs = require('node:fs');
const path = require('node:path');
function aggregate(directory = path.resolve(__dirname, '../experiments/results')) {
  const evidence = JSON.parse(fs.readFileSync(path.join(directory, 'evidence-summary.json'), 'utf8'));
  const evaluation = JSON.parse(fs.readFileSync(path.join(directory, 'evaluation.json'), 'utf8'));
  const lines = ['track,configuration,observations,public_functions,internal_functions,answered,total,accuracy,coverage'];
  for (const row of evidence) lines.push(`A,${row.configuration},${row.observations},${row.publicFunctions},${row.internalFunctions},,,,`);
  lines.push(`B,frequency,,,,${evaluation.answered},${evaluation.total},${evaluation.accuracy ?? ''},${evaluation.coverage}`);
  fs.writeFileSync(path.join(directory, 'tables.csv'), lines.join('\n') + '\n');
}
if (require.main === module) aggregate(process.argv[2]);
module.exports = {aggregate};
