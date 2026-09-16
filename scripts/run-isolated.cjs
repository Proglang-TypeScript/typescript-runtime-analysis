const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const [input, entry, output] = process.argv.slice(2);
const args = process.argv.slice(5);
const option = (name, fallback) => {const index = args.indexOf(`--${name}`); return index < 0 ? fallback : args[index + 1];};
if (!input || !entry || !output) throw new Error('Usage: node scripts/run-isolated.cjs PACKAGE_DIR RELATIVE_ENTRY OUTPUT_DIR [--module ./] [--evidence test] [--repository URL] [--commit SHA] [--image IMAGE]');
const source = fs.realpathSync(input);
const tool = fs.realpathSync(path.resolve(__dirname, '..'));
fs.mkdirSync(output, {recursive: true});
const destination = fs.realpathSync(output);
const selected = path.resolve(source, entry);
if (!selected.startsWith(source + path.sep) || !fs.realpathSync(selected).startsWith(source + path.sep)) throw new Error('Entry must remain inside package directory');
for (const directory of [source, tool, destination]) if (directory.includes(',')) throw new Error('Comma in mount path is unsupported');
const metadata = JSON.parse(fs.readFileSync(path.join(source, 'package.json'), 'utf8'));
const uid = process.getuid?.() || 1000;
const gid = process.getgid?.() || 1000;
const publicModule = option('module', './');
const evidence = option('evidence', 'test');
const repository = option('repository', metadata.repository?.url || metadata.repository || 'unrecorded');
const commit = option('commit', 'unrecorded');
const image = option('image', 'node:24-bookworm-slim');
const result = spawnSync('docker', ['run', '--rm', '--network=none', '--read-only', `--user=${uid}:${gid}`, '--cpus=1', '--memory=1g',
  '--pids-limit=128', '--cap-drop=ALL', '--security-opt=no-new-privileges', '--tmpfs=/tmp:rw,size=256m',
  '--mount', `type=bind,source=${source},target=/input,readonly`, '--mount', `type=bind,source=${tool},target=/tool,readonly`,
  '--mount', `type=bind,source=${destination},target=/output`, '-e', 'TS_ANALYSIS_ISOLATED=1',
  image, 'node', '/tool/packages/cli/index.cjs', 'trace', `/input/${entry}`, '--target-root', '/input',
  '--out', '/output/trace.json', '--package', metadata.name, '--version', metadata.version, '--evidence', evidence,
  '--module', publicModule, '--repository', repository, '--commit', commit],
  {stdio: 'inherit', timeout: 60000});
if (result.error) throw result.error;
process.exitCode = result.status === null ? 1 : result.status;
