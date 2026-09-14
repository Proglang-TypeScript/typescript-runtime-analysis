import {identity, nonParametric, tagIdentity} from './module';
const transported: {fresh: boolean} = identity({fresh: true});
const transportedBoolean: boolean = identity(false);
const conservative: number | string = nonParametric('new input');
const constrained: {tag: string; extra: number} = tagIdentity({tag: 'new', extra: 2});
