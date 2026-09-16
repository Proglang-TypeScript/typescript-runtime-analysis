declare const Module: {
    "compactQueue"(queue: any[]): void;
    "formats": {
        "formatters": {
            "RFC3986": {
                "proxyMethod"(value: string): string;
            };
            "RFC3986%%PROXY_METHOD%%"(value: string): string;
        };
    };
    "isNonNullishPrimitive"(v: string): boolean;
    "isOverflow"(obj: object): boolean;
    "normalizeParseOptions"(opts?: undefined): object;
    "normalizeStringifyOptions"(opts?: undefined): object;
    "parse"(str: string, opts?: undefined): object;
    "parseQueryStringKeys"(givenKey: string, val: string, options: object, valuesParsed: boolean): object;
};
export = Module;
