function selectVersion(versions) {
  const stable = (Array.isArray(versions) ? versions : [versions]).filter(version => typeof version === 'string' && /^\d+\.\d+\.\d+$/.test(version));
  stable.sort((left, right) => {const first = left.split('.').map(Number); const second = right.split('.').map(Number); return first[0] - second[0] || first[1] - second[1] || first[2] - second[2];});
  if (!stable.length) throw new Error('No exact stable runtime version matches the declaration line');
  return stable.at(-1);
}
function selector(record, override) {
  if (!record.runtimePackage || !/^(?:@[a-z0-9_.-]+\/)?[a-z0-9][a-z0-9_.-]*$/.test(record.runtimePackage)) throw new Error('Non-npm or invalid runtime package mapping');
  if (override) {
    if (!/^\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?$/.test(override)) throw new Error('Override must be an exact version');
    return {requested: record.runtimePackage + '@' + override, policy: 'explicit-version-override', exact: override};
  }
  const line = /^(\d+)\.(\d+)\./.exec(record.declarationVersion || '');
  if (!line) throw new Error('Declaration version lacks a runtime major/minor line; supply an explicit version');
  return {requested: `${record.runtimePackage}@${line[1]}.${line[2]}.x`, policy: 'latest-stable-in-declaration-major-minor-line'};
}
function verifyMetadata(metadata, name, version) {
  if (Array.isArray(metadata)) {
    if (metadata.length !== 1) throw new Error('Expected one exact-version registry metadata record');
    metadata = metadata[0];
  }
  if (metadata.name !== name || metadata.version !== version) throw new Error('Registry identity differs from the exact requested package/version');
  const url = new URL(metadata.dist?.tarball || '');
  if (url.protocol !== 'https:' || url.hostname !== 'registry.npmjs.org' || !/^sha512-[A-Za-z0-9+/]+=*$/.test(metadata.dist?.integrity || '')) throw new Error('Registry metadata lacks the required HTTPS tarball and SHA512 integrity');
  return {name, version, tarball: url.href, integrity: metadata.dist.integrity, repository: metadata.repository || null, sourceCommit: metadata.gitHead || null, status: 'metadata-available', runtimeExecution: 'not-assessed'};
}
module.exports = {selectVersion, selector, verifyMetadata};
