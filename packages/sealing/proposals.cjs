const {validate} = require('../trace-schema/index.cjs');
const {inputs, trial} = require('./trials.cjs');
const variable = {kind: 'variable', name: 'T'};
function propose(trace) {
  validate('invocationTrace', trace);
  const groups = new Map();
  for (const invocation of trace.invocations) {
    if (!invocation.public) continue;
    groups.set(invocation.functionId, [...(groups.get(invocation.functionId) || []), invocation]);
  }
  return [...groups.entries()].sort(([left], [right]) => left.localeCompare(right)).filter(([, rows]) => rows.length >= 2 && rows.length <= 128 && rows.every(row => row.outcome === 'return' && row.arguments.length === 1 && !row.callbacks.length && row.arguments[0].type === row.result.type && row.arguments[0].valueId === row.result.valueId)).map(([functionId, rows]) => ({schemaVersion: 1, functionId, functionName: rows[0].functionName, kind: 'identity-generic', text: `export function ${rows[0].functionName}<T>(arg0: T): T;\n`, contract: {variables: {T: null}, parameters: [variable], result: variable}, proposingInvocations: rows.map(row => row.invocationId), observations: rows, provenance: trace.provenance}));
}
function verdict(trials) {
  if (trials.some(row => row.result.status === 'seal-violation')) return 'rejected';
  if (trials.length >= 2 && trials.every(row => row.result.status === 'passed')) return 'validated-on-supported-trials';
  return 'inconclusive';
}
function challenge(moduleFile, candidate, {trustedFixture = false} = {}) {
  const trials = inputs(candidate.contract.variables.T).map(input => ({input, result: trial(moduleFile, candidate.functionName, {contract: candidate.contract, bindings: {T: input.family}, inputs: [input]}, {trustedFixture})}));
  return {candidate, verdict: verdict(trials), trials, counterexamples: trials.filter(row => row.result.status === 'seal-violation'), inconclusive: trials.filter(row => !['passed', 'seal-violation'].includes(row.result.status))};
}
function refine(validation) {
  if (validation.verdict !== 'rejected') return {decision: 'unchanged', reason: 'No classified seal violation', candidate: validation.candidate};
  const property = validation.counterexamples.flatMap(row => row.result.events).find(event => event.code === 'OPAQUE_PROPERTY_ACCESS')?.property;
  const rows = validation.candidate.observations;
  if (property && /^[A-Za-z_$][\w$]*$/.test(property) && rows.every(row => row.arguments[0].type === 'object' && row.arguments[0].complete && row.arguments[0].properties?.[property]?.type === 'string')) {
    const candidate = {...validation.candidate, kind: 'constrained-generic', text: `export function ${validation.candidate.functionName}<T extends { ${property}: string }>(arg0: T): T;\n`, contract: {...validation.candidate.contract, variables: {T: {fields: {[property]: 'string'}}}}};
    return {decision: 'constraint', reason: `Opaque property counterexample plus all proposing observations justify ${property}: string`, candidate};
  }
  const outputTypes = [...new Set([...rows.map(row => row.result.type), ...validation.counterexamples.map(row => row.result.concreteOutcome.output?.type).filter(Boolean)])].sort();
  const inputTypes = [...new Set([...rows.map(row => row.arguments[0].type), ...validation.counterexamples.map(row => row.input.family)])].sort();
  const supported = type => type === 'array' ? 'unknown[]' : type;
  return {decision: 'overloads', reason: 'Reject parametricity; shallow overloads retain all observed state/output types. These non-generic overloads are not sealing-validated or universally sound.', text: inputTypes.map(type => `export function ${validation.candidate.functionName}(arg0: ${supported(type)}): ${outputTypes.map(supported).join(' | ')};`).join('\n') + '\n', supportingInvocations: validation.candidate.proposingInvocations, counterexampleTrials: validation.counterexamples.map(row => row.result.trialId), validated: false};
}
module.exports = {propose, challenge, refine, verdict};
