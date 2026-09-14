const api = require('./module');
if (api.identity(true) !== true) throw new Error('Identity mismatch');
const object = {fresh: true};
if (api.identity(object) !== object) throw new Error('Object identity mismatch');
if (api.first([false, true]) !== false) throw new Error('Element mismatch');
if (api.convert('number', '7') !== 7) throw new Error('Number mismatch');
if (api.convert('string', 8) !== '8') throw new Error('String mismatch');
