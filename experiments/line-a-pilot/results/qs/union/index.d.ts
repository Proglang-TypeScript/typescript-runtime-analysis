declare const Module: {
    "combine"(a: string | any[], b: string | any[], arrayLimit: number, plainObjects: boolean, throwOnLimitExceeded: boolean): any[];
    "compactQueue"(queue: any[]): void;
    "formats": {
        "formatters": {
            "RFC3986": {
                "proxyMethod"(value: string): string;
            };
            "RFC3986%%PROXY_METHOD%%"(value: string): string;
        };
    };
    "indices"(prefix: string, key: string): string;
    "isNonNullishPrimitive"(v: string): boolean;
    "isNonNullishPrimitive"(v: string | object | any[]): boolean;
    "isOverflow"(obj: object): boolean;
    "isOverflow"(obj: string | object | any[]): boolean;
    "normalizeParseOptions"(opts?: undefined): object;
    "normalizeStringifyOptions"(opts?: undefined): object;
    "parse"(str: string, opts?: undefined): object;
    "parseQueryStringKeys"(givenKey: string, val: string, options: object, valuesParsed: boolean): object;
    "parseQueryStringKeys"(givenKey: string, val: string | any[], options: object, valuesParsed: boolean): object;
};
export = Module;
