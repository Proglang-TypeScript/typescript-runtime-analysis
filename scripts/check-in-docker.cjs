const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const name = `tra-check-${process.pid}-${Date.now()}`;
function docker(args, options = {}) {
  const result = spawnSync('docker', args, {stdio: 'inherit', ...options});
  if (result.error || result.status !== 0) throw new Error(result.error?.message || `Docker command exited ${result.status}`);
  return result;
}
const archive = spawnSync('tar', ['--format=ustar', '-C', root, '--exclude=.git', '--exclude=node_modules', '--exclude=dist', '--exclude=work',
  '--exclude=experiments/results', '-cf', '-', '.'], {maxBuffer: 64 * 1024 * 1024, env: {...process.env, COPYFILE_DISABLE: '1'}});
if (archive.error || archive.status !== 0) throw new Error(archive.error?.message || archive.stderr.toString());
let created = false;
try {
  docker(['run', '-d', '--name', name, '--user=node', '--cpus=2', '--memory=2g', '--pids-limit=256', '--cap-drop=ALL',
    '--security-opt=no-new-privileges', 'node:24-bookworm-slim', 'sleep', '900']);
  created = true;
  docker(['exec', name, 'mkdir', '-p', '/tmp/app']);
  docker(['exec', '-i', name, 'tar', '-xf', '-', '-C', '/tmp/app'], {input: archive.stdout, stdio: ['pipe', 'inherit', 'inherit']});
  docker(['exec', '-w', '/tmp/app', name, 'npm', 'ci']);
  docker(['network', 'disconnect', 'bridge', name]);
  docker(['exec', '-w', '/tmp/app', name, 'npm', 'run', 'check'], {timeout: 600000});
  const destination = path.join(root, 'work', name);
  fs.mkdirSync(destination, {recursive: true});
  docker(['cp', `${name}:/tmp/app/experiments/results`, destination]);
  console.log(`Successful clean Node24 validation. Artifacts: ${destination}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  if (created) spawnSync('docker', ['rm', '-f', name], {stdio: 'ignore'});
}
