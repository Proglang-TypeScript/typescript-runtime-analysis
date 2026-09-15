import api = require('./module');
const direct: number = api.calculate(1);
const alias: number = api.alias(2);
const nested: number = api.nested.calculate(3);
void [direct, alias, nested];
