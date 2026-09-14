let fallback = 1;
function configure(value) { fallback = value; }
function identity(value) { return value; }
function nonParametric(value) { return fallback; }
function tagIdentity(value) { value.tag; return value; }
function callbackIdentity(value, callback) { return callback(value); }
function primitiveBranch(value) { return typeof value === 'number' ? value : 0; }
function coerce(value) { return value + 0; }
function equal(value) { return value === value; }
function native(value) { return Array.isArray(value); }
function serialize(value) { return JSON.stringify(value); }
function objectIdentity(value) { return Object.is(value, value); }
function reflect(value) { return Object.getPrototypeOf(value); }
function ordinaryException(value) { throw new Error('Known ordinary exception'); }
function inspectType(value) { return typeof value; }
function swallowCoercion(value) { try { +value; } catch (error) {} return value; }
function swallowPeek(value) { try { value.tag; } catch (error) {} return value; }
module.exports = {configure, identity, nonParametric, tagIdentity, callbackIdentity, primitiveBranch, coerce, equal, native, serialize, objectIdentity, reflect, ordinaryException, inspectType, swallowCoercion, swallowPeek};
