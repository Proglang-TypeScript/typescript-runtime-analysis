const Ajv = require('ajv');
const schema = require('./schema.json');
const ajv = new Ajv({allErrors: true, strict: true});
ajv.addSchema(schema, 'analysis');
ajv.addSchema(require('./relational-schema.json'), 'relational');
ajv.addSchema(require('../sealing/trial-schema.json'), 'sealing');

function validate(kind, value) {
  const check = ajv.getSchema(`analysis#/definitions/${kind}`) || ajv.getSchema(`relational#/definitions/${kind}`) || ajv.getSchema(`sealing#/definitions/${kind}`);
  if (!check) throw new Error(`Unknown schema: ${kind}`);
  if (!check(value)) throw new Error(`${kind}: ${ajv.errorsText(check.errors)}`);
  if (kind === 'invocationTrace') {
    const calls = new Map();
    for (const invocation of value.invocations) {
      if (calls.has(invocation.invocationId) || invocation.executionId !== value.provenance.executionId) throw new Error('Invocation identity/provenance mismatch');
      calls.set(invocation.invocationId, invocation);
    }
    for (const invocation of value.invocations) {
      if (invocation.parentInvocationId !== null) {
        const parent = calls.get(invocation.parentInvocationId);
        if (!parent || parent.order >= invocation.order) throw new Error('Invalid invocation parent link');
      }
      for (const callback of invocation.callbacks) {
        const child = calls.get(callback.invocationId);
        if (!child || child.parentInvocationId !== invocation.invocationId || invocation.arguments[callback.argumentIndex]?.type !== 'function') throw new Error('Invalid callback invocation link');
      }
    }
  }
  return value;
}

function merge(traces, {publicOnly = false} = {}) {
  traces.forEach(trace => validate('trace', trace));
  const observations = new Map();
  for (const trace of traces) {
    for (const observation of trace.observations) {
      if (!publicOnly || observation.public) observations.set(JSON.stringify(observation), observation);
    }
  }
  return [...observations.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([, value]) => value);
}

module.exports = {validate, merge};
