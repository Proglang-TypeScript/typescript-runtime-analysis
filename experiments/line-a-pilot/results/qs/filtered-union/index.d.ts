declare const Module: {
    "formats": {
        "formatters": {
            "RFC3986": {
                "proxyMethod"(value: string): string;
            };
            "RFC3986%%PROXY_METHOD%%"(value: string): string;
        };
    };
    "parse"(str: string, opts?: undefined): object;
};
export = Module;
