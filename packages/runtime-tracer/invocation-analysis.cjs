const fs = require('node:fs');
const sandbox = global.J$;
const analysis = sandbox.analysis;
const frames = [];
const completed = [];
const objects = new WeakMap();
const primitives = new Map();
const negativeZero = Symbol('negative-zero');
let nextValue = 0;
let nextCall = 0;
const unwrap = value => sandbox.utils.wrapperObjectsHandler.getFinalRealObjectFromProxy(value);

function snapshot(wrapped, depth = 0) {
  const value = unwrap(wrapped);
  const type = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
  const references = type === 'object' || type === 'array' || type === 'function' ? objects : primitives;
  const key = Object.is(value, -0) ? negativeZero : value;
  if (!references.has(key)) references.set(key, `value:${nextValue++}`);
  const result = {type, valueId: references.get(key), complete: true};
  if (value === null || typeof value === 'boolean' || typeof value === 'number' && Number.isFinite(value) || typeof value === 'string' && value.length <= 128) result.literal = value;
  if (type === 'array' || type === 'object') {
    if (depth >= 1) return {...result, complete: false};
    const descriptors = Object.getOwnPropertyDescriptors(value);
    const keys = type === 'array' ? Array.from({length: Math.min(value.length, 16)}, (_, index) => String(index)) : Object.keys(descriptors).filter(key => descriptors[key].enumerable).sort();
    result.complete = keys.length <= 16 && (type !== 'array' || value.length <= 16);
    const fields = keys.slice(0, 16).map(key => {
      const descriptor = descriptors[key];
      if (!descriptor || !Object.hasOwn(descriptor, 'value')) {
        result.complete = false;
        return [key, {type: 'unknown', valueId: 'unobserved', complete: false}];
      }
      return [key, snapshot(descriptor.value, depth + 1)];
    });
    if (type === 'array') result.elements = fields.map(([, item]) => item);
    else result.properties = Object.fromEntries(fields);
  }
  return result;
}

const enter = analysis.functionEnter;
analysis.functionEnter = function (iid, fn, receiver, args) {
  const returned = enter.apply(this, arguments);
  if (args.length > 16) throw new Error('Invocation argument limit exceeded');
  const parent = frames.at(-1);
  if (!sandbox.recordObservation()) {
    frames.push({recorded: false});
    return returned;
  }
  const frame = {call: nextCall++, functionId: (fn.proxyMethod || fn).functionId, arguments: Array.from(args, value => snapshot(value)), receiver: snapshot(receiver), callbacks: [], parent: parent?.call ?? null};
  frame.recorded = true;
  if (parent?.recorded) {
    const identity = snapshot(fn).valueId;
    const index = parent.arguments.findIndex(value => value.type === 'function' && value.valueId === identity);
    if (index >= 0) parent.callbacks.push({argumentIndex: index, call: frame.call});
  }
  frames.push(frame);
  return returned;
};
const exit = analysis.functionExit;
analysis.functionExit = function (iid, result, exception) {
  const frame = frames.pop();
  if (!frame) throw new Error('Invocation stack mismatch');
  if (!frame.recorded) return exit.apply(this, arguments);
  frame.outcome = exception === undefined ? 'return' : 'throw';
  frame.result = snapshot(exception === undefined ? result : exception.exception);
  completed.push(frame);
  return exit.apply(this, arguments);
};
const end = analysis.endExecution;
analysis.endExecution = function () {
  end.apply(this, arguments);
  if (frames.length) throw new Error('Incomplete invocation stack');
  fs.writeFileSync(process.env.TRACE_INVOCATIONS_OUTPUT, JSON.stringify(completed.sort((left, right) => left.call - right.call)));
};
