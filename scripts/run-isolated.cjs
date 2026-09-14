const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const [input, entry, output] = process.argv.slice(2);
if (!input || !entry || !output) throw new Error('Usage: node scripts/run-isolated.cjs PACKAGE_DIR RELATIVE_ENTRY OUTPUT_DIR');
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
const result = spawnSync('docker', ['run', '--rm', '--network=none', '--read-only', `--user=${uid}:${gid}`, '--cpus=1', '--memory=1g',
  '--pids-limit=128', '--cap-drop=ALL', '--security-opt=no-new-privileges', '--tmpfs=/tmp:rw,size=256m',
  '--mount', `type=bind,source=${source},target=/input,readonly`, '--mount', `type=bind,source=${tool},target=/tool,readonly`,
  '--mount', `type=bind,source=${destination},target=/output`, '-e', 'TS_ANALYSIS_ISOLATED=1',
  'node:24-bookworm-slim', 'node', '/tool/packages/cli/index.cjs', 'trace', `/input/${entry}`, '--target-root', '/input',
  '--out', '/output/trace.json', '--package', metadata.name, '--version', metadata.version, '--evidence', 'test'],
  {stdio: 'inherit', timeout: 60000});
if (result.error) throw result.error;
process.exitCode = result.status === null ? 1 : result.status;
