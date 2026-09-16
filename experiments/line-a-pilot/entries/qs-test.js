'use strict';
const qs = require('./');
qs.parse('a[b]=c');
qs.parse('a[]=b&a[]=c');
qs.stringify({a: {b: 'c'}});
qs.stringify({a: ['b', 'c']}, {arrayFormat: 'indices'});
