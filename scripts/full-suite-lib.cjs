const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_PROFILES = path.resolve(__dirname, '../experiments/full-suite/profiles.json');

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function loadProfile(name, file = DEFAULT_PROFILES) {
  const catalog = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (catalog.schemaVersion !== 1 || !catalog.profiles || typeof catalog.profiles !== 'object') {
    throw new Error('Unsupported full-suite profile catalog');
  }
  const profile = catalog.profiles[name];
  if (!profile) throw new Error(`Unknown full-suite profile: ${name}`);
  if (!['mocha', 'tape'].includes(profile.framework)) throw new Error(`Unsupported test framework: ${profile.framework}`);
  if (!Array.isArray(profile.tests) || profile.tests.length === 0) throw new Error(`Profile ${name} has no test patterns`);
  if (!profile.lock || !['source', 'generate'].includes(profile.lock.mode) || !/^[a-f0-9]{64}$/.test(profile.lock.sha256)) {
    throw new Error(`Profile ${name} has an invalid lock policy`);
  }
  if (profile.lock.mode === 'generate' && (!profile.installDependencies || Object.keys(profile.installDependencies).length === 0)) {
    throw new Error(`Profile ${name} has no generated-lock dependencies`);
  }
  for (const field of ['timeoutMs', 'maxObservations']) {
    if (!Number.isSafeInteger(profile[field]) || profile[field] <= 0) throw new Error(`Profile ${name} has invalid ${field}`);
  }
  return {...profile, profile: name, image: profile.image || catalog.runtimeImage};
}

function testFiles(source, patterns) {
  source = fs.realpathSync(source);
  const files = new Set();
  for (const pattern of patterns) {
    for (const relative of fs.globSync(pattern, {cwd: source, exclude: ['node_modules/**', '.git/**']})) {
      const absolute = fs.realpathSync(path.join(source, relative));
      if (!absolute.startsWith(source + path.sep) || !fs.statSync(absolute).isFile()) {
        throw new Error(`Test path escapes package root: ${relative}`);
      }
      files.add(path.relative(source, absolute).split(path.sep).join('/'));
    }
  }
  const selected = [...files].sort((left, right) => left.localeCompare(right));
  if (selected.length === 0) throw new Error(`No test files matched: ${patterns.join(', ')}`);
  return selected;
}

function testAggregate(source, files) {
  source = fs.realpathSync(source);
  const rows = files.map(file => `${file}\0${sha256(path.join(source, file))}`);
  return crypto.createHash('sha256').update(rows.join('\n') + '\n').digest('hex');
}

function harness(framework, files) {
  const selected = JSON.stringify(files);
  if (framework === 'mocha') return `'use strict';
const path = require('node:path');
const Mocha = require('/input/node_modules/mocha');
const mocha = new Mocha({color: false, reporter: 'spec'});
for (const file of ${selected}) mocha.addFile(path.join('/input', file));
mocha.run(failures => { process.exitCode = failures ? 1 : 0; });
`;
  if (framework === 'tape') return `'use strict';\n${files.map(file => `require(${JSON.stringify(`/input/${file}`)});`).join('\n')}\n`;
  throw new Error(`Unsupported test framework: ${framework}`);
}

function verifySource(source, profile) {
  const metadata = JSON.parse(fs.readFileSync(path.join(source, 'package.json'), 'utf8'));
  if (metadata.name !== profile.package || metadata.version !== profile.version) {
    throw new Error(`Expected ${profile.package}@${profile.version}, found ${metadata.name}@${metadata.version}`);
  }
  for (const [relative, expected] of Object.entries(profile.sourceHashes || {})) {
    const actual = sha256(path.join(source, relative));
    if (actual !== expected) throw new Error(`Source hash mismatch for ${relative}: ${actual}`);
  }
  return metadata;
}

module.exports = {DEFAULT_PROFILES, harness, loadProfile, sha256, testAggregate, testFiles, verifySource};
