const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const {selectVersion, selector, verifyMetadata} = require('../packages/generic-api-census/availability.cjs');
const {hash} = require('../packages/generic-api-census/index.cjs');
const args = process.argv.slice(2);
const option = (name, fallback) => {const index = args.indexOf('--' + name); return index < 0 ? fallback : args[index + 1];};
function main() {
  const censusRoot = path.resolve(option('census', 'work/census'));
  const run = JSON.parse(fs.readFileSync(path.join(censusRoot, 'run.json'), 'utf8'));
  if (!option('packages')) throw new Error('Select declaration package directories explicitly with --packages; metadata queries are never automatic');
  const selected = option('packages').split(',').sort();
  if (selected.length > 50 || new Set(selected).size !== selected.length || selected.some(name => !run.selection.includes(name))) throw new Error('Invalid selection or metadata-query budget exceeded');
  const overrides = option('versions') ? JSON.parse(fs.readFileSync(option('versions'), 'utf8')) : {};
  const directory = path.resolve(option('out', path.join(censusRoot, 'availability')));
  if (directory === censusRoot || directory === path.join(censusRoot, 'packages')) throw new Error('Use a separate availability output directory');
  const implementation = hash(fs.readFileSync(__filename) + fs.readFileSync(path.resolve(__dirname, '../packages/generic-api-census/availability.cjs')));
  const identity = hash(JSON.stringify({censusIdentity: run.identity, selected, overrides, implementation}));
  let entries = [];
  if (fs.existsSync(directory) && fs.readdirSync(directory).length) {
    const previous = JSON.parse(fs.readFileSync(path.join(directory, 'catalog.json'), 'utf8'));
    if (!args.includes('--resume') || previous.identity !== identity) throw new Error('Existing availability output differs; use a fresh directory');
    entries = previous.entries;
  } else fs.mkdirSync(directory, {recursive: true});
  const work = path.join(directory, 'work');
  fs.mkdirSync(work, {recursive: true});
  const userconfig = path.join(work, 'empty.npmrc');
  const globalconfig = path.join(work, 'empty-global.npmrc');
  fs.writeFileSync(userconfig, '');
  fs.writeFileSync(globalconfig, '');
  const commands = [];
  function view(specification, field, label) {
    const executable = process.env.npm_execpath ? process.execPath : 'npm';
    const parameters = [...(process.env.npm_execpath ? [process.env.npm_execpath] : []), 'view', specification, ...(field ? [field] : []), '--json', '--registry=https://registry.npmjs.org', '--userconfig=' + userconfig, '--globalconfig=' + globalconfig, '--cache=' + path.join(work, 'cache')];
    const result = spawnSync(executable, parameters, {cwd: work, encoding: 'utf8', timeout: 20000, maxBuffer: 1024 * 1024, env: {PATH: process.env.PATH, HOME: work, TZ: 'UTC'}});
    fs.writeFileSync(path.join(directory, label + '.stdout.json'), result.stdout || '');
    fs.writeFileSync(path.join(directory, label + '.stderr.txt'), result.stderr || '');
    commands.push({executable, parameters, status: result.status, error: result.error?.code || null, stdoutSha256: hash(result.stdout || ''), stderrSha256: hash(result.stderr || '')});
    if (result.status !== 0 || result.error) throw new Error('Metadata lookup failed: ' + (result.error?.code || 'NPM_VIEW_FAILURE'));
    return JSON.parse(result.stdout);
  }
  function save() {
    fs.writeFileSync(path.join(directory, 'catalog.json'), JSON.stringify({schemaVersion: 1, identity, censusIdentity: run.identity, implementation, node: process.version, provenance: run.provenance, registry: 'https://registry.npmjs.org', queriedOn: new Date().toISOString(), entries, counts: {selectedDeclarationPackages: selected.length, obtainableRuntimePackages: new Set(entries.filter(entry => entry.status === 'metadata-available').map(entry => entry.name)).size, verifiedExecutableExports: 0, runtimeAssessment: 'not-assessed'}, scope: 'Metadata only: no tarballs downloaded, lifecycle scripts run, packages installed or exports executed'}, null, 2) + '\n');
    const file = path.join(directory, 'commands.json');
    const previous = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
    fs.writeFileSync(file, JSON.stringify([...previous, ...commands.splice(0)], null, 2) + '\n');
  }
  save();
  for (const name of selected) {
    if (entries.some(entry => entry.directory === name && entry.status === 'metadata-available')) continue;
    const record = JSON.parse(fs.readFileSync(path.join(censusRoot, 'packages', name + '.json'), 'utf8')).package;
    let entry;
    try {
      if (!record.runtimePackage) entry = {directory: name, status: 'non-npm', reason: 'No npm mapping established; builtins/nonNpm require manual treatment', runtimeExecution: 'not-assessed'};
      else {
        const request = selector(record, overrides[name]);
        const version = request.exact || selectVersion(view(request.requested, 'version', name + '-versions'));
        const metadata = view(record.runtimePackage + '@' + version, null, name + '-exact');
        entry = {directory: name, declarationVersion: record.declarationVersion, matchingPolicy: request.policy, ...verifyMetadata(metadata, record.runtimePackage, version)};
      }
    } catch (error) {entry = {directory: name, name: record.runtimePackage, status: 'metadata-unavailable', reason: error.message, runtimeExecution: 'not-assessed'};}
    entries = [...entries.filter(entry => entry.directory !== name), entry].sort((left, right) => left.directory.localeCompare(right.directory));
    save();
    console.log(`${name}: ${entry.status}${entry.version ? ' ' + entry.version : ''}`);
  }
}
try {main();} catch (error) {console.error(error.message); process.exitCode = 1;}
