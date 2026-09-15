declare const Module: {
  calculate(value: number): number;
  alias(value: number): number;
  nested: {
    calculate(value: number): number;
  };
};
export = Module;
