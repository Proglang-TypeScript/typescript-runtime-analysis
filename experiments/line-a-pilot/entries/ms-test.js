'use strict';
const ms = require('./');
ms('1m');
ms('-1.5h');
ms(100);
ms(2 * 60000, {long: true});
