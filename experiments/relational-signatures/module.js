function identity(value) { return value; }
function first(values) { return values[0]; }
function convert(kind, value) {
  if (kind === 'number') return Number(value);
  if (kind === 'string') return String(value);
  throw new Error('Unsupported discriminant');
}
function apply(value, callback) { return callback(value); }
function fail(value) { throw new Error('Fixture failure'); }
module.exports = {identity, first, convert, apply, fail};
