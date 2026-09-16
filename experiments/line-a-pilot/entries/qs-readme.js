'use strict';
const qs = require('./');
qs.parse('a=c');
qs.parse('foo[bar]=baz');
qs.stringify({a: 'c'});
