#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const [command, ...args] = process.argv.slice(2);
const option = (name, fallback) => {const index = args.indexOf(`--${name}`); return index < 0 ? fallback : args[index + 1];};
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
try {
  if (command === 'trace') {
    require('../runtime-tracer/index.cjs').trace(args[0], {targetRoot: option('target-root'), output: option('out', 'trace.json'),
      package: option('package', 'fixture'), version: option('version', '0.0.0-fixture'), evidence: option('evidence', 'fixture'),
      publicModule: option('module', 'module'), repository: option('repository'), commit: option('commit'), trustedFixture: args.includes('--trusted-fixture'), captureInvocations: args.includes('--invocations')});
  } else if (command === 'generate') {
    const files = args.filter((argument, index) => !argument.startsWith('--') && (index === 0 || !args[index - 1].startsWith('--')));
    require('../declaration-generator/index.cjs').generate(files, {moduleName: option('module', 'module'), output: option('out', 'index.d.ts'), publicOnly: args.includes('--public-only')});
  } else if (command === 'compare') {
    console.log(JSON.stringify(require('../declaration-compare/index.cjs').compare(args[0], args[1]), null, 2));
  } else if (command === 'patterns') {
    const patterns = require('../pattern-analysis/index.cjs').extract(args[0], {packageName: option('package', 'fixture'), fileName: option('file-name', path.basename(args[0]))});
    const trace = option('trace');
    console.log(JSON.stringify(trace ? require('../pattern-analysis/index.cjs').distributions(require('../pattern-analysis/index.cjs').match(patterns, read(trace))) : patterns, null, 2));
  } else if (command === 'experiment') {
    require('../../scripts/experiment.cjs');
  } else if (command === 'synthesize') {
    const files = args.filter((argument, index) => !argument.startsWith('--') && (index === 0 || !args[index - 1].startsWith('--')));
    const results = require('../relational-signatures/index.cjs').synthesize(files.map(read));
    const output = option('out', 'relational.d.ts');
    const text = results.map(result => result.candidates.find(candidate => candidate.kind === result.selected)?.text || '').join('\n');
    fs.mkdirSync(path.dirname(output), {recursive: true});
    fs.writeFileSync(output, text || 'export {};\n');
    fs.writeFileSync(`${output}.diagnostics.json`, JSON.stringify(results, null, 2) + '\n');
  } else {
    throw new Error('Usage: tra trace|generate|compare|patterns|synthesize|experiment. See README.md for options.');
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
