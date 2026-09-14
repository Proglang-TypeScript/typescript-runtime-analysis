var assert = require('node:assert/strict');
var metadata = require('transducers-js/package.json');
var library = require('transducers-js');
assert.equal(metadata.version, '0.4.174');
var value = {label: 'pilot-object'};
assert.equal(library.identity(value), value);
assert.equal(library.identity(7), 7);
assert.equal(library.identity(null), null);
console.log('CENSUS_PILOT_RESULT=' + JSON.stringify({package: 'transducers-js', version: metadata.version, outcome: 'returned', calls: [{export: 'identity', cases: ['object-reference', 'number', 'null'], assertionsPassed: 3}]}));
