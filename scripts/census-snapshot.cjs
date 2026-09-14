const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const pin = require('../experiments/census/snapshot.json');
function git(directory, args) {
  const result = spawnSync('git', ['-C', directory, ...args], {encoding: 'utf8', timeout: 300000, maxBuffer: 4 * 1024 * 1024});
  if (result.status !== 0 || result.error) throw new Error(`Git failed: ${args[0]}: ${result.stderr || result.error}`);
  return result.stdout.trim();
}
function inspect(directory) {
  const root = fs.realpathSync(directory);
  if (git(root, ['rev-parse', '--show-toplevel']) !== root) throw new Error('Snapshot must be a separate checkout');
  if (git(root, ['rev-parse', 'HEAD']) !== pin.commit) throw new Error('Snapshot does not match the checked-in commit pin');
  if (git(root, ['remote', 'get-url', 'origin']) !== pin.repository) throw new Error('Unexpected snapshot origin');
  if (git(root, ['status', '--porcelain'])) throw new Error('Snapshot has pre-existing changes; refusing a non-reproducible census');
  const sparse = git(root, ['config', '--bool', '--default', 'false', '--get', 'core.sparseCheckout']) === 'true';
  const packages = git(root, ['ls-tree', '--name-only', 'HEAD:types']).split('\n').filter(Boolean).sort();
  return {repository: pin.repository, commit: pin.commit, scope: sparse ? 'sparse-development' : 'full', pinnedCorpusPackages: packages.length, availablePackages: fs.readdirSync(path.join(root, 'types'), {withFileTypes: true}).filter(entry => entry.isDirectory()).map(entry => entry.name).sort()};
}
function prepare(directory, smoke = false) {
  const root = path.resolve(directory);
  if (fs.existsSync(root)) {
    const metadata = inspect(root);
    if ((metadata.scope === 'full') === smoke) throw new Error('Existing snapshot scope differs; choose a new directory');
    return metadata;
  }
  fs.mkdirSync(root, {recursive: true});
  git(root, ['init']);
  git(root, ['remote', 'add', 'origin', pin.repository]);
  if (smoke) {git(root, ['sparse-checkout', 'init', '--cone']); git(root, ['sparse-checkout', 'set', ...pin.smokePackages.map(name => 'types/' + name)]);}
  git(root, ['fetch', '--filter=blob:none', '--depth=1', 'origin', pin.commit]);
  git(root, ['checkout', '--detach', pin.commit]);
  return inspect(root);
}
module.exports = {prepare, inspect};
