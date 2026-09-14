import {identity, first, convert} from './module';
const numeric: number = identity(1);
const textual: string = identity('seen');
const numberElement: number = first([1, 2]);
const stringElement: string = first(['a', 'b']);
const numericConversion: number = convert('number', '1');
const stringConversion: string = convert('string', 3);
