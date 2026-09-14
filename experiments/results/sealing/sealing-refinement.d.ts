export function identity<T>(arg0: T): T;

export function nonParametric(arg0: unknown[]): number | string;
export function nonParametric(arg0: boolean): number | string;
export function nonParametric(arg0: null): number | string;
export function nonParametric(arg0: number): number | string;
export function nonParametric(arg0: object): number | string;
export function nonParametric(arg0: string): number | string;
export function nonParametric(arg0: undefined): number | string;

export function tagIdentity<T extends { tag: string }>(arg0: T): T;
