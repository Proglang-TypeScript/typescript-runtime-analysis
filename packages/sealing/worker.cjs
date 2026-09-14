const fs = require('node:fs');
const {instantiate, TrialFault, shallow} = require('./index.cjs');
const {preflight} = require('./preflight.cjs');
const moduleFile = process.argv[2];
const exportName = process.argv[3];
const summarize = value => ({type: shallow(value), ...(value === null || ['number', 'string', 'boolean'].includes(typeof value) ? {literal: value} : {})});
function argument(input) {
  if (input.family === 'undefined') return undefined;
  if (input.family === 'callback') {
    if (input.operation !== 'identity') throw new Error('Unsupported client callback descriptor');
    return value => value;
  }
  if (!['number', 'string', 'boolean', 'null', 'object', 'array'].includes(input.family) || shallow(input.value) !== input.family) throw new Error('Invalid concrete input descriptor');
  return input.value;
}
function load() {
  delete require.cache[require.resolve(moduleFile)];
  const fn = require(moduleFile)[exportName];
  if (typeof fn !== 'function') throw new Error('Missing provider export');
  return fn;
}
let session;
let concreteOutcome = {status: 'not-run'};
let output;
let stage = 'harness';
function report(status, code) {
  return {schemaVersion: 1, trialId: session?.trialId || 'not-instantiated', status, code, events: session?.events || [], concreteOutcome, ...(output ? {output} : {})};
}
let result;
try {
  const plan = JSON.parse(fs.readFileSync(0, 'utf8'));
  const fn = load();
  session = instantiate(plan.contract, plan.bindings);
  const inputs = structuredClone(plan.inputs).map(argument);
  if (inputs.length !== plan.contract.parameters.length) session.fail('harness-failure', 'TRIAL_ARITY', 'arguments');
  const crossed = structuredClone(plan.inputs).map(argument).map((value, index) => session.monitor(plan.contract.parameters[index], value, 'negative', `argument:${index}`));
  stage = 'concrete-control';
  try {
    output = summarize(fn(...inputs));
    concreteOutcome = {status: 'return', output};
  } catch (error) {
    concreteOutcome = {status: 'exception', name: error.name};
    result = report('exception', 'ORDINARY_CONCRETE_EXCEPTION');
  }
  if (!result) {
    const provider = load();
    const unsupported = preflight(provider, plan.contract);
    if (unsupported) result = report('inconclusive', unsupported);
    else {
      stage = 'sealed-provider';
      const returned = provider(...crossed);
      const unsealed = session.monitor(plan.contract.result, returned, 'positive', 'result');
      output = summarize(unsealed);
      if (plan.contract.result.kind === 'function') session.fail('inconclusive', 'RETURNED_FUNCTION_REQUIRES_ADDITIONAL_CALLS', 'result');
      const sticky = session.events.find(event => event.kind === 'inconclusive') || session.events.find(event => event.kind === 'seal-violation') || session.events.find(event => event.kind === 'harness-failure');
      result = sticky ? report(sticky.kind, sticky.code) : report('passed', 'FRESH_SEAL_TRANSPORTED');
    }
  }
} catch (error) {
  const sticky = session?.events.find(event => event.kind === 'inconclusive') || session?.events.find(event => event.kind === 'seal-violation') || session?.events.find(event => event.kind === 'harness-failure');
  if (sticky) result = report(sticky.kind, sticky.code);
  else if (error instanceof TrialFault) result = report(error.kind, error.code);
  else result = report(stage === 'sealed-provider' ? 'exception' : 'harness-failure', stage === 'sealed-provider' ? 'ORDINARY_SEALED_EXCEPTION' : 'HARNESS_LOAD_OR_INPUT_FAILURE');
}
process.stdout.write(JSON.stringify(result));
