const path = require('node:path');

function normalizedIncludes(value) {
  if (value === undefined) return null;
  if (!Array.isArray(value) || value.length === 0) throw new Error('Instrumentation paths must be a non-empty array');
  return value.map(item => {
    if (typeof item !== 'string' || !item || path.isAbsolute(item) || item.split('/').includes('..')) {
      throw new Error(`Invalid instrumentation path: ${item}`);
    }
    return item.split(path.sep).join('/');
  });
}

function shouldInstrument(filename, targetRoot, includes) {
  if (!filename.startsWith(targetRoot + path.sep) || filename.split(path.sep).includes('node_modules')) return false;
  if (includes === null) return true;
  const relative = path.relative(targetRoot, filename).split(path.sep).join('/');
  return includes.some(item => item.endsWith('/') ? relative.startsWith(item) : relative === item);
}

module.exports = {normalizedIncludes, shouldInstrument};
