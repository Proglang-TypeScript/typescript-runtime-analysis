var calculate = require('./module');
function testOnlyCheck(value) {
  return value * 2;
}
if (calculate(4, 5) !== 9) throw new Error('Incorrect sum');
if (testOnlyCheck(3) !== 6) throw new Error('Incorrect test helper');
