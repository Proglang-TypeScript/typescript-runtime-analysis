const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const {harness, loadProfile, sha256, testAggregate, testFiles, verifySource} = require('./full-suite-lib.cjs');

const [input, output, profileName] = process.argv.slice(2);
if (!input || !output || !profileName) {
  throw new Error('Usage: node scripts/prepare-full-suite.cjs PACKAGE_DIR PREPARED_DIR PROFILE [--profiles FILE]');
}
const args = process.argv.slice(5);
const option = (name, fallback) => { const index = args.indexOf(`--${name}`); return index < 0 ? fallback : args[index + 1]; };
const source = fs.realpathSync(input);
const destination = path.resolve(output);
const profile = loadProfile(profileName, option('profiles'));
verifySource(source, profile);
if (fs.existsSync(destination)) throw new Error(`Prepared directory already exists: ${destination}`);
fs.mkdirSync(path.dirname(destination), {recursive: true});
const temporary = `${destination}.tmp-${process.pid}`;
const excluded = new Set(['.git', 'node_modules']);
const copyFilter = candidate => {
  const relative = path.relative(source, candidate);
  return relative === '' || !relative.split(path.sep).some(part => excluded.has(part));
};
const docker = process.env.DOCKER_BIN || 'docker';
const uid = process.getuid?.() || 1000;
const gid = process.getgid?.() || 1000;
let complete = false;
try {
  fs.cpSync(source, temporary, {recursive: true, filter: copyFilter});
  const lock = path.join(temporary, 'package-lock.json');
  const packageFile = path.join(temporary, 'package.json');
  const sourcePackage = fs.readFileSync(packageFile, 'utf8');
  if (profile.lock.mode === 'generate') {
    fs.rmSync(lock, {force: true});
    const installPackage = {
      name: profile.package,
      version: profile.version,
      private: true,
      dependencies: profile.installDependencies
    };
    fs.writeFileSync(path.join(temporary, '.tra-full-suite-package.json'), JSON.stringify(installPackage, null, 2) + '\n');
    fs.writeFileSync(packageFile, JSON.stringify(installPackage, null, 2) + '\n');
  }
  if (profile.lock.mode === 'source') {
    if (!fs.existsSync(lock)) throw new Error('Profile requires the source package-lock.json');
    if (sha256(lock) !== profile.lock.sha256) throw new Error('Source package lock hash does not match the profile');
  }
  const install = profile.lock.mode === 'generate'
    ? 'npm install --package-lock-only --ignore-scripts --no-audit --no-fund && npm ci --include=dev --ignore-scripts --no-audit --no-fund'
    : 'npm ci --include=dev --ignore-scripts --no-audit --no-fund';
  const result = spawnSync(docker, ['run', '--rm', '--read-only', `--user=${uid}:${gid}`, '--cpus=2', '--memory=2g',
    '--pids-limit=256', '--cap-drop=ALL', '--security-opt=no-new-privileges', '--tmpfs=/tmp:rw,size=512m',
    '--mount', `type=bind,source=${temporary},target=/package`, '--workdir', '/package', '-e', 'HOME=/tmp/home',
    '-e', 'npm_config_cache=/tmp/npm-cache', profile.image, 'sh', '-lc', install],
  {stdio: 'inherit', timeout: profile.prepareTimeoutMs || 1200000});
  if (result.error || result.status !== 0) throw new Error(result.error?.message || `Dependency preparation exited ${result.status}`);
  if (profile.lock.mode === 'generate') fs.writeFileSync(packageFile, sourcePackage);
  const lockHash = sha256(lock);
  if (lockHash !== profile.lock.sha256) throw new Error(`Prepared package lock hash mismatch: ${lockHash}`);
  const selected = testFiles(temporary, profile.tests);
  const entry = path.join(temporary, '.tra-full-suite.cjs');
  fs.writeFileSync(entry, harness(profile.framework, selected));
  const preparation = {
    schemaVersion: 1,
    profile: profile.profile,
    package: profile.package,
    version: profile.version,
    repository: profile.repository,
    commit: profile.commit,
    framework: profile.framework,
    instrumentPaths: profile.instrumentPaths,
    tests: selected,
    testsSha256: testAggregate(temporary, selected),
    packageJsonSha256: sha256(path.join(temporary, 'package.json')),
    packageLockSha256: lockHash,
    harnessSha256: sha256(entry),
    runtimeImage: profile.image,
    lifecycleScriptsRun: false,
    dependencyNetworkAccess: true
  };
  fs.writeFileSync(path.join(temporary, '.tra-full-suite-preparation.json'), JSON.stringify(preparation, null, 2) + '\n');
  fs.renameSync(temporary, destination);
  complete = true;
  console.log(JSON.stringify(preparation, null, 2));
} finally {
  if (!complete) fs.rmSync(temporary, {recursive: true, force: true});
}
