const api = require('./module');
api.identity(1);
api.identity('seen');
api.configure(1);
api.nonParametric(1);
api.configure('seen');
api.nonParametric('seen');
api.tagIdentity({tag: 'left'});
api.tagIdentity({tag: 'right'});
