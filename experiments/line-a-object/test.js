const api = require('./module');
const privateHelper = require('./internal');
api.alias(2);
api.nested.calculate(3);
privateHelper(4);
