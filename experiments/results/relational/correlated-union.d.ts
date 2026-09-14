export type ConvertInvocation = { arguments: ["number", string]; result: number } | { arguments: ["string", number]; result: string };
export function convert(...args: ConvertInvocation["arguments"]): ConvertInvocation["result"];
