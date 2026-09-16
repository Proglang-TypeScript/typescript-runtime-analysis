export = Ms;
declare function Ms(val: string, options?: undefined): number;
declare function Ms(val: number, options?: Ms.I__options | Ms.I__options__1): string;
declare namespace Ms {
    export interface I__options {
        long: boolean;
    }
    export interface I__options__1 {
        long: boolean;
    }
    export function parse(str: string): number;
    export function fmtShort(ms: number): string;
    export function fmtLong(ms: number): string;
    export function plural(ms: number, msAbs: number, n: number, name: string): string;
}
