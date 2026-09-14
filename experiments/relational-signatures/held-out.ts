import {identity, first, convert} from './module';
const booleanIdentity: boolean = identity(true);
const objectIdentity: {fresh: boolean} = identity({fresh: true});
const booleanElement: boolean = first([false, true]);
const numericConversion: number = convert('number', '7');
const stringConversion: string = convert('string', 8);
