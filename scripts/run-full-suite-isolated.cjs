const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const {loadProfile, sha256, testAggregate, verifySource} = require('./full-suite-lib.cjs');

const [input, output, profileName] = process.argv.slice(2);
if (!input || !output || !profileName) {
  throw new Error('Usage: node scripts/run-full-suite-isolated.cjs PREPARED_DIR OUTPUT_DIR PROFILE [--invocations] [--profiles FILE]');
}
const args = process.argv.slice(5);
const option = (name, fallback) => { const index = args.indexOf(`--${name}`); return index < 0 ? fallback : args[index + 1]; };
const source = fs.realpathSync(input);
const tool = fs.realpathSync(path.resolve(__dirname, '..'));
const profile = loadProfile(profileName, option('profiles'));
verifySource(source, profile);
const preparationFile = path.join(source, '.tra-full-suite-preparation.json');
const entry = path.join(source, '.tra-full-suite.cjs');
const preparation = JSON.parse(fs.readFileSync(preparationFile, 'utf8'));
if (preparation.schemaVersion !== 1 || preparation.profile !== profile.profile || preparation.transparent !== (profile.transparent === true) ||
    preparation.truncateObservations !== (profile.truncateObservations === true) || preparation.sampleEvery !== (profile.sampleEvery || null)) {
  throw new Error('Prepared package profile mismatch');
}
if (sha256(path.join(source, 'package-lock.json')) !== preparation.packageLockSha256 ||
    sha256(entry) !== preparation.harnessSha256 || testAggregate(source, preparation.tests) !== preparation.testsSha256) {
  throw new Error('Prepared package changed after dependency freezing');
}
const runnerPackage = path.join(source, 'node_modules', profile.framework, 'package.json');
if (!fs.existsSync(runnerPackage)) throw new Error(`Prepared package is missing ${profile.framework}`);
if (fs.existsSync(output)) throw new Error(`Output directory already exists: ${path.resolve(output)}`);
fs.mkdirSync(output, {recursive: true});
const destination = fs.realpathSync(output);
for (const directory of [source, tool, destination]) if (directory.includes(',')) throw new Error('Comma in mount path is unsupported');
fs.copyFileSync(preparationFile, path.join(destination, 'preparation.json'));
fs.copyFileSync(path.join(source, 'package-lock.json'), path.join(destination, 'package-lock.json'));
const installPackage = path.join(source, '.tra-full-suite-package.json');
if (fs.existsSync(installPackage)) fs.copyFileSync(installPackage, path.join(destination, 'install-package.json'));
fs.copyFileSync(entry, path.join(destination, 'suite-entry.cjs'));
const uid = process.getuid?.() || 1000;
const gid = process.getgid?.() || 1000;
const docker = process.env.DOCKER_BIN || 'docker';
const invocationArgs = args.includes('--invocations') ? ['--invocations'] : [];
const transparencyArgs = profile.transparent ? ['--transparent'] : [];
const observationArgs = profile.truncateObservations ? ['--truncate-observations', '--sample-every', String(profile.sampleEvery)] : [];
const result = spawnSync(docker, ['run', '--rm', '--network=none', '--read-only', `--user=${uid}:${gid}`, '--cpus=1', '--memory=2g',
  '--pids-limit=256', '--cap-drop=ALL', '--security-opt=no-new-privileges', '--tmpfs=/tmp:rw,size=512m',
  '--mount', `type=bind,source=${source},target=/input,readonly`, '--mount', `type=bind,source=${tool},target=/tool,readonly`,
  '--mount', `type=bind,source=${destination},target=/output`, '-e', 'TS_ANALYSIS_ISOLATED=1', profile.image,
  'node', '/tool/packages/cli/index.cjs', 'trace', '/input/.tra-full-suite.cjs', '--target-root', '/input', '--out', '/output/trace.json',
  '--package', profile.package, '--version', profile.version, '--evidence', 'test', '--module', profile.publicModule,
  '--repository', profile.repository, '--commit', profile.commit, '--timeout-ms', String(profile.timeoutMs),
  '--max-observations', String(profile.maxObservations), '--instrument-paths', JSON.stringify(profile.instrumentPaths), ...transparencyArgs, ...observationArgs, ...invocationArgs],
{stdio: 'inherit', timeout: profile.timeoutMs + 120000});
const run = {
  schemaVersion: 1,
  profile: profile.profile,
  package: profile.package,
  version: profile.version,
  framework: profile.framework,
  instrumentPaths: profile.instrumentPaths,
  transparent: profile.transparent === true,
  truncateObservations: profile.truncateObservations === true,
  sampleEvery: profile.sampleEvery || null,
  tests: preparation.tests,
  testsSha256: preparation.testsSha256,
  packageLockSha256: preparation.packageLockSha256,
  runtimeImage: profile.image,
  network: 'none',
  sourceMount: 'read-only',
  invocations: args.includes('--invocations'),
  timeoutMs: profile.timeoutMs,
  maxObservations: profile.maxObservations,
  status: result.status,
  signal: result.signal,
  error: result.error?.message || null
};
fs.writeFileSync(path.join(destination, 'full-suite.json'), JSON.stringify(run, null, 2) + '\n');
if (result.error) throw result.error;
process.exitCode = result.status === null ? 1 : result.status;
