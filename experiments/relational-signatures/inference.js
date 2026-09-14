const api = require('./module');
api.identity(1);
api.identity('seen');
api.first([1, 2]);
api.first(['a', 'b']);
api.convert('number', '1');
api.convert('number', '2');
api.convert('string', 3);
api.convert('string', 4);
api.apply(5, function increment(value) { return value + 1; });
try { api.fail(1); } catch (error) { if (!(error instanceof Error)) throw error; }
