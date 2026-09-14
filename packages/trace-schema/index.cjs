const Ajv = require('ajv');
const schema = require('./schema.json');
const ajv = new Ajv({allErrors: true, strict: true});
ajv.addSchema(schema, 'analysis');

function validate(kind, value) {
  const check = ajv.getSchema(`analysis#/definitions/${kind}`);
  if (!check) throw new Error(`Unknown schema: ${kind}`);
  if (!check(value)) throw new Error(`${kind}: ${ajv.errorsText(check.errors)}`);
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
