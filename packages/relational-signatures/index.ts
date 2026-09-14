import {validate} from '@tra/trace-schema';
import ts from 'typescript';

export interface Value {
  type: string;
  valueId: string;
  complete: boolean;
  literal?: string | number | boolean | null;
  elements?: Value[];
  properties?: Record<string, Value>;
}
export interface Invocation {
  invocationId: string;
  functionId: string;
  functionName: string;
  arguments: Value[];
  receiver: Value;
  result: Value;
  outcome: 'return' | 'throw';
  callbacks: {argumentIndex: number; invocationId: string}[];
  executionId: string;
  public: boolean;
}
export interface InvocationTrace {
  schemaVersion: 1;
  provenance: {package: string; version: string; repository: string; commit: string; executionId: string};
  invocations: Invocation[];
}
export interface Relationship {
  kind: 'equality' | 'container-element' | 'discriminant';
  from: string;
  to: string;
}
export interface Candidate {
  kind: 'component-union' | 'observation-overloads' | 'identity-generic' | 'element-generic' | 'discriminated-overloads' | 'correlated-union';
  text: string;
  supportingInvocations: string[];
  relationships: Relationship[];
  reason: string;
}
export interface Synthesis {
  schemaVersion: 1;
  functionId: string;
  functionName: string;
  selected: Candidate['kind'] | null;
  candidates: Candidate[];
  diagnostics: string[];
}
export interface Options {
  minSupport?: number;
  maxInvocations?: number;
  maxBranches?: number;
  publicOnly?: boolean;
}

const union = (types: string[]) => [...new Set(types)].sort().join(' | ') || 'never';
function typeOf(value: Value): string {
  if (value.type === 'array') return `Array<${value.elements ? union(value.elements.map(typeOf)) : 'unknown'}>`;
  if (value.type === 'function') return '((...args: never[]) => unknown)';
  return value.type === 'unknown' ? 'unknown' : value.type;
}
const parameters = (types: string[]) => types.map((type, index) => `arg${index}: ${type}`).join(', ');
const signature = (name: string, types: string[], result: string) => `export function ${name}(${parameters(types)}): ${result};`;
const literalType = (value: Value) => Object.hasOwn(value, 'literal') ? JSON.stringify(value.literal) : null;
const diversity = (values: Value[]) => new Set(values.map(typeOf)).size >= 2;
const equal = (left: Value, right: Value) => left.type === right.type && left.valueId === right.valueId && left.valueId !== 'unobserved';

export function synthesize(traces: InvocationTrace[], options: Options = {}): Synthesis[] {
  const {minSupport = 2, maxInvocations = 128, maxBranches = 8, publicOnly = true} = options;
  if (!Number.isInteger(minSupport) || minSupport < 2 || !Number.isInteger(maxInvocations) || maxInvocations < minSupport || maxInvocations > 100000 || !Number.isInteger(maxBranches) || maxBranches < 2 || maxBranches > 8) throw new Error('Invalid synthesis bounds');
  const groups = new Map<string, Map<string, Invocation>>();
  for (const trace of traces) {
    validate('invocationTrace', trace);
    const seen = new Set<string>();
    for (const invocation of trace.invocations) {
      if (invocation.executionId !== trace.provenance.executionId || seen.has(invocation.invocationId)) throw new Error('Invocation identity/provenance mismatch');
      seen.add(invocation.invocationId);
      if (publicOnly && !invocation.public) continue;
      const provenance = trace.provenance;
      const key = `${provenance.package}@${provenance.version}:${provenance.repository}:${provenance.commit}:${invocation.functionId}`;
      const group = groups.get(key) || new Map<string, Invocation>();
      const previous = group.get(invocation.invocationId);
      if (previous && JSON.stringify(previous) !== JSON.stringify(invocation)) throw new Error('Conflicting invocation identity');
      group.set(invocation.invocationId, invocation);
      groups.set(key, group);
    }
  }
  return [...groups.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([functionId, group]) => {
    const invocations = [...group.values()].sort((left, right) => left.invocationId.localeCompare(right.invocationId));
    const name = invocations[0].functionName;
    const result: Synthesis = {schemaVersion: 1, functionId, functionName: name, selected: null, candidates: [], diagnostics: []};
    const finish = () => validate('synthesis', result) as Synthesis;
    const scanner = ts.createScanner(ts.ScriptTarget.Latest, false, ts.LanguageVariant.Standard, name);
    if (scanner.scan() !== ts.SyntaxKind.Identifier || scanner.scan() !== ts.SyntaxKind.EndOfFileToken) {
      result.diagnostics.push('Unsupported export identifier');
      return finish();
    }
    if (invocations.length > maxInvocations) {
      result.diagnostics.push('Invocation budget exceeded; no truncated-evidence synthesis');
      return finish();
    }
    const returned = invocations.filter(row => row.outcome === 'return');
    if (!returned.length) {
      result.diagnostics.push('No successful outcomes');
      return finish();
    }
    const arity = returned[0].arguments.length;
    if (returned.some(row => row.arguments.length !== arity) || arity > 4) {
      result.diagnostics.push('Unsupported variable arity or signature size');
      return finish();
    }
    const support = returned.map(row => row.invocationId);
    const add = (kind: Candidate['kind'], text: string, reason: string, relationships: Relationship[] = []) => result.candidates.push({kind, text: text + '\n', supportingInvocations: support, relationships, reason});
    const argumentTypes = Array.from({length: arity}, (_, index) => union(returned.map(row => typeOf(row.arguments[index]))));
    add('component-union', signature(name, argumentTypes, union(returned.map(row => typeOf(row.result)))), 'Independent argument/result unions discard invocation correlations');
    const individual = [...new Set(returned.map(row => signature(name, row.arguments.map(value => literalType(value) ?? typeOf(value)), typeOf(row.result))))].sort();
    if (individual.length <= maxBranches) add('observation-overloads', individual.join('\n'), 'One literal/shallow overload per distinct observed invocation; no extrapolation');
    else result.diagnostics.push('Observation-overload branch budget exceeded');
    if (returned.length < minSupport || returned.length !== invocations.length || returned.some(row => row.callbacks.length || row.arguments.some(value => value.type === 'function'))) {
      result.diagnostics.push('Insufficient support, exceptional outcomes or callback inference outside this scaffold');
      return finish();
    }
    if (arity === 1 && returned.every(row => equal(row.arguments[0], row.result)) && diversity(returned.map(row => row.arguments[0]))) {
      add('identity-generic', `export function ${name}<T>(arg0: T): T;`, 'Argument/result value equality across distinct types supports an identity-style candidate, not a proof of universal behavior', [{kind: 'equality', from: 'argument:0', to: 'result'}]);
      result.selected = 'identity-generic';
    }
    if (arity === 1 && returned.every(row => row.arguments[0].type === 'array' && row.arguments[0].complete && row.arguments[0].elements?.length && row.arguments[0].elements.some(element => equal(element, row.result))) && diversity(returned.map(row => row.result))) {
      add('element-generic', `export function ${name}<T>(arg0: T[]): T;`, 'Returned value matches an element of each complete non-empty observed container; empty containers are unsupported', [{kind: 'container-element', from: 'argument:0.elements', to: 'result'}]);
      result.selected = 'element-generic';
    }
    if (arity >= 1 && returned.every(row => row.arguments[0].type === 'string' && literalType(row.arguments[0]) !== null)) {
      const branches = new Map<string, Invocation[]>();
      for (const row of returned) {
        const tag = literalType(row.arguments[0])!;
        branches.set(tag, [...(branches.get(tag) || []), row]);
      }
      if (branches.size >= 2 && branches.size <= maxBranches && [...branches.values()].every(rows => rows.length >= minSupport) && new Set([...branches.values()].map(rows => union(rows.map(row => typeOf(row.result))))).size >= 2) {
        const rows = [...branches.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([tag, evidence]) => ({types: [tag, ...Array.from({length: arity - 1}, (_, index) => union(evidence.map(row => typeOf(row.arguments[index + 1]))))], result: union(evidence.map(row => typeOf(row.result)))}));
        const relationships: Relationship[] = [{kind: 'discriminant', from: 'argument:0.literal', to: 'arguments/result'}];
        add('discriminated-overloads', rows.map(row => signature(name, row.types, row.result)).join('\n'), 'Shallow literal-discriminated branches retain observed argument/result associations', relationships);
        const relationName = name[0].toUpperCase() + name.slice(1) + 'Invocation';
        add('correlated-union', `export type ${relationName} = ${rows.map(row => `{ arguments: [${row.types.join(', ')}]; result: ${row.result} }`).join(' | ')};\nexport function ${name}(...args: ${relationName}["arguments"]): ${relationName}["result"];`, 'Invocation union preserves tuple/result rows; projected function return is a union and deliberately loses call-site output precision', relationships);
        result.selected = 'discriminated-overloads';
      }
    }
    if (!result.selected) result.diagnostics.push('No supported relational candidate; baseline-only abstention');
    return finish();
  });
}
