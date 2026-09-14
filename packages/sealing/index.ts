import {randomUUID} from 'node:crypto';

export type Primitive = 'number' | 'string' | 'boolean' | 'undefined' | 'null' | 'object' | 'array';
export type Polarity = 'negative' | 'positive';
export type Term = {kind: 'variable'; name: string} | {kind: 'primitive'; type: Primitive} | {kind: 'function'; parameters: Term[]; result: Term};
export interface Constraint {fields: Record<string, 'number' | 'string' | 'boolean'>}
export interface Contract {variables: Record<string, Constraint | null>; parameters: Term[]; result: Term}
export interface Event {kind: 'seal' | 'unseal' | 'seal-violation' | 'inconclusive' | 'harness-failure'; code: string; path: string; variable?: string; property?: string; polarity?: Polarity}
export class TrialFault extends Error {
  constructor(public kind: 'seal-violation' | 'inconclusive' | 'harness-failure', public code: string, public path: string, public property?: string) {super(code);}
}
export const shallow = (value: unknown): Primitive | 'function' | 'symbol' | 'bigint' => value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
const flip = (polarity: Polarity): Polarity => polarity === 'negative' ? 'positive' : 'negative';

export function instantiate(contract: Contract, bindings: Record<string, Primitive>) {
  const trialId = randomUUID();
  const events: Event[] = [];
  const seals = new WeakMap<object, {variable: string; value: unknown}>();
  const brands = new Set(Object.keys(contract.variables));
  const fail = (kind: TrialFault['kind'], code: string, path: string, property?: string): never => {
    events.push({kind, code, path, ...(property ? {property} : {})});
    throw new TrialFault(kind, code, path, property);
  };
  function constraintCheck(value: unknown, constraint: Constraint, path: string) {
    if (shallow(value) !== 'object' || Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) fail('harness-failure', 'INADMISSIBLE_CONSTRAINT_INPUT', path);
    for (const [property, type] of Object.entries(constraint.fields)) {
      const descriptor = Object.getOwnPropertyDescriptor(value, property);
      if (!descriptor || !Object.hasOwn(descriptor, 'value') || shallow(descriptor.value) !== type) fail('harness-failure', 'INADMISSIBLE_CONSTRAINT_INPUT', path, property);
    }
  }
  function monitor(term: Term, value: unknown, polarity: Polarity, path: string): unknown {
    if (term.kind === 'primitive') {
      if (shallow(value) !== term.type) fail(polarity === 'negative' ? 'harness-failure' : 'seal-violation', 'PRIMITIVE_BOUNDARY_MISMATCH', path);
      return value;
    }
    if (term.kind === 'function') {
      if (typeof value !== 'function') fail(polarity === 'negative' ? 'harness-failure' : 'seal-violation', 'FUNCTION_BOUNDARY_MISMATCH', path);
      const callable = value as (...args: unknown[]) => unknown;
      return function (...args: unknown[]) {
        if (args.length !== term.parameters.length) fail('inconclusive', 'CALLBACK_ARITY', path);
        const crossed = args.map((argument, index) => monitor(term.parameters[index], argument, flip(polarity), `${path}.argument:${index}`));
        return monitor(term.result, callable(...crossed), polarity, `${path}.result`);
      };
    }
    if (term.kind !== 'variable') return fail('inconclusive', 'UNSUPPORTED_TYPE_TERM', path);
    const variable = term.name;
    if (!brands.has(variable) || !bindings[variable]) fail('harness-failure', 'UNBOUND_TYPE_VARIABLE', path);
    if (polarity === 'positive') {
      const metadata = value !== null && (typeof value === 'object' || typeof value === 'function') ? seals.get(value) : undefined;
      if (!metadata || metadata.variable !== variable) return fail('seal-violation', 'MISSING_OR_WRONG_SEAL', path);
      events.push({kind: 'unseal', code: 'CHECKED_FRESH_BRAND', variable, path, polarity});
      return metadata.value;
    }
    if (shallow(value) !== bindings[variable]) fail('harness-failure', 'INADMISSIBLE_TYPE_BINDING', path);
    const constraint = contract.variables[variable];
    if (constraint) constraintCheck(value, constraint, path);
    const observe = (code: string): never => fail('inconclusive', code, path);
    const token = new Proxy(Object.create(null), {
      get(_target, property) {
        if (property === Symbol.toPrimitive || property === 'valueOf' || property === 'toString') return observe('COERCION_OBSERVABILITY');
        if (property === 'toJSON') return observe('SERIALIZATION_OBSERVABILITY');
        if (typeof property === 'symbol' || property === 'constructor' || property === '__proto__') return observe('PROXY_OBSERVABILITY');
        if (constraint && Object.hasOwn(constraint.fields, property)) return Object.getOwnPropertyDescriptor(value, property)!.value;
        if (bindings[variable] !== 'object') return observe('PRIMITIVE_OR_CONTAINER_PROPERTY_WRAPPING');
        return fail('seal-violation', 'OPAQUE_PROPERTY_ACCESS', path, property);
      },
      set() {return observe('MUTATION_OBSERVABILITY');},
      deleteProperty() {return observe('MUTATION_OBSERVABILITY');},
      defineProperty() {return observe('MUTATION_OBSERVABILITY');},
      getPrototypeOf() {return observe('PROXY_OBSERVABILITY');},
      setPrototypeOf() {return observe('PROXY_OBSERVABILITY');},
      ownKeys() {return observe('SERIALIZATION_OR_REFLECTION');},
      has() {return observe('PROXY_OBSERVABILITY');},
      getOwnPropertyDescriptor() {return observe('PROXY_OBSERVABILITY');},
      isExtensible() {return observe('PROXY_OBSERVABILITY');},
      preventExtensions() {return observe('PROXY_OBSERVABILITY');},
    });
    seals.set(token, {variable, value});
    events.push({kind: 'seal', code: 'ALLOCATED_FRESH_BRAND', variable, path, polarity});
    return token;
  }
  return {trialId, events, monitor, fail};
}
