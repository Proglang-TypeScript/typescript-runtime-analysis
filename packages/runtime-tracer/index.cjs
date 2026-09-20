const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const {spawnSync} = require('node:child_process');
const {validate} = require('../trace-schema/index.cjs');
const {SourceMapConsumer} = require('source-map-js');

const analyses = [
  'utils/initialize.js', 'utils/functions.js', 'utils/metadataStore.js', 'utils/functionsExecutionStack.js',
  'utils/interactionContainerFinder.js', 'utils/objectTraceIdMap.js', 'utils/argumentWrapperObjectBuilder.js',
  'utils/functionIdHandler.js', 'utils/argumentProxyBuilder.js', 'utils/interactionWithResultHandler.js',
  'utils/wrapperObjectsHandler.js', 'utils/toPrimitive.js', 'utils/operators/relationalComparisonOperatorTypeCoercion.js',
  'utils/operators/sumOperatorTypeCoercion.js', 'utils/operators/operatorsTypeCoercionAnalyzer.js',
  'utils/argumentContainer.js', 'utils/functionContainer.js', 'utils/interactions/interaction.js',
  'utils/interactions/activeInteraction.js', 'utils/interactions/getFieldInteraction.js', 'utils/interactions/inputValueInteraction.js',
  'utils/interactions/methodCallInteraction.js', 'utils/interactions/putFieldInteraction.js', 'utils/interactions/usedAsArgumentInteraction.js',
  'utils/interactions/convertedToInteraction.js', 'utils/interactions/operatorInteraction.js', 'utils/operators/operatorInteractionBuilder.js',
  'analysis/analysis.js', ...['functionEnter', 'functionExit', 'declare', 'invokeFunPre', 'invokeFun', 'getField',
    'putFieldPre', 'write', 'binaryPre', 'unaryPre', 'conditional', 'literal'].map(name => `analysis/callbacks/${name}.js`),
];
const types = new Set(['undefined', 'null', 'boolean', 'number', 'string', 'bigint', 'symbol', 'object', 'array', 'function']);
const shallow = value => types.has(value) ? value : 'unknown';

function trace(entry, options) {
  if (!options.trustedFixture && process.env.TS_ANALYSIS_ISOLATED !== '1') {
    throw new Error('External package execution requires scripts/run-isolated.cjs. Only checked-in fixtures may use trustedFixture.');
  }
  entry = fs.realpathSync(entry);
  const targetRoot = fs.realpathSync(options.targetRoot || path.dirname(entry));
  if (!entry.startsWith(targetRoot + path.sep)) throw new Error('Entry point must be inside targetRoot');
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'tra-'));
  const rawFile = path.join(temporary, 'raw.json');
  const invocationFile = path.join(temporary, 'invocations.json');
  try {
    const result = spawnSync(process.execPath, [path.join(__dirname, 'jalangi-command.cjs'), '--inlineSource', '--inlineIID',
      ...analyses.flatMap(file => ['--analysis', path.join(__dirname, file)]),
      ...(options.captureInvocations ? ['--analysis', path.join(__dirname, 'invocation-analysis.cjs')] : []), entry], {
      cwd: temporary, env: {PATH: process.env.PATH, KAFKA_ENABLED: 'false', TRACE_WORK_DIR: temporary, TRACE_RAW_OUTPUT: rawFile,
        TRACE_TARGET_ROOT: targetRoot, TRACE_PUBLIC_MODULE: options.publicModule || 'module',
        TRACE_MAX_OBSERVATIONS: String(options.maxObservations || 100000),
        ...(options.instrumentPaths ? {TRACE_INSTRUMENT_PATHS: JSON.stringify(options.instrumentPaths)} : {}),
        ...(options.captureInvocations ? {TRACE_INVOCATIONS_OUTPUT: invocationFile} : {})},
      timeout: options.timeout || 30000, maxBuffer: 8 * 1024 * 1024, encoding: 'utf8',
    });
    if (result.error || result.status !== 0) throw new Error(`Instrumentation/execution failed: ${result.error?.message || result.stderr}`);
    if (!fs.existsSync(rawFile)) throw new Error('Tracer produced no raw runtime information');
    const raw = JSON.parse(fs.readFileSync(rawFile, 'utf8'));
    const executionId = crypto.createHash('sha256').update(JSON.stringify({entry: path.relative(targetRoot, entry), package: options.package,
      evidence: options.evidence || 'fixture', code: fs.readFileSync(entry, 'utf8')})).digest('hex').slice(0, 24);
    const provenance = {package: options.package || path.basename(targetRoot), version: options.version || '0.0.0-fixture',
      repository: options.repository || 'local-fixture', commit: options.commit || 'uncommitted-fixture', evidence: options.evidence || 'fixture',
      entryPoint: path.relative(targetRoot, entry), publicModule: options.publicModule || 'module', publicBoundary: 'commonjs-own-descriptor-v1', backend: 'jalangi2',
      backendVersion: 'bc879287b1678de6e3c423f5debe63207559525b', executionId};
    const observations = [];
    const exportPaths = container => raw.publicExports?.pathsByFunctionId?.[container.functionId] || [];
    const location = source => {
      const map = source && raw.sourceMaps?.[source.file];
      const original = map && new SourceMapConsumer(map).originalPositionFor({line: source.line, column: source.column - 1});
      return {file: path.relative(targetRoot, source?.file || entry), line: original?.line || source?.line || 1, column: original?.column !== null && original?.column !== undefined ? original.column + 1 : source?.column || 1};
    };
    for (const container of Object.values(raw.functions)) {
      const source = location(container.sourceLocation);
      if (!container.sourceLocation || source.file.startsWith('..') || source.file.split(path.sep).includes('node_modules')) continue;
      const functionId = `${source.file}:${source.line}:${source.column}:${container.functionName}`;
      const paths = exportPaths(container);
      for (const argument of Object.values(container.args || {})) {
        for (const interaction of argument.interactions) {
          const {argumentId, interactionId, ...details} = interaction;
          observations.push({functionId, functionName: container.functionName, position: 'parameter', index: argument.argumentIndex,
            type: shallow(interaction.typeof), source, executionId, order: observations.length, public: paths.length > 0, exportPaths: paths, interaction: {kind: interaction.code, ...details}});
        }
      }
      for (const returned of container.returnTypeOfs) observations.push({functionId, functionName: container.functionName, position: 'result', index: -1,
        type: shallow(returned.typeOf), source, executionId, order: observations.length, public: paths.length > 0, exportPaths: paths, interaction: {kind: 'return', traceId: returned.traceId}});
    }
    const operators = raw.patterns.map((operator, order) => ({operator: operator.operator, source: location(operator), leftType: shallow(operator.leftType),
      rightType: shallow(operator.rightType), executionId, order}));
    const envelope = validate('trace', {schemaVersion: 1, provenance, observations, operators});
    let invocationTrace;
    if (options.captureInvocations) {
      const invocations = JSON.parse(fs.readFileSync(invocationFile, 'utf8')).map(frame => {
        const container = raw.functions[frame.functionId];
        if (!container?.sourceLocation) throw new Error('Invocation has no source location');
        const source = location(container.sourceLocation);
        const functionId = `${source.file}:${source.line}:${source.column}:${container.functionName}`;
        const invocationId = call => `${executionId}:${call}`;
        return {invocationId: invocationId(frame.call), functionId, functionName: container.functionName, source, executionId, order: frame.call,
          public: exportPaths(container).length > 0, exportPaths: exportPaths(container),
          arguments: frame.arguments, receiver: frame.receiver, result: frame.result, outcome: frame.outcome,
          parentInvocationId: frame.parent === null ? null : invocationId(frame.parent),
          callbacks: frame.callbacks.map(callback => ({argumentIndex: callback.argumentIndex, invocationId: invocationId(callback.call)}))};
      });
      invocationTrace = validate('invocationTrace', {schemaVersion: 1, provenance, invocations});
    }
    fs.mkdirSync(path.dirname(options.output), {recursive: true});
    fs.writeFileSync(options.output, JSON.stringify(envelope, null, 2) + '\n');
    fs.writeFileSync(`${options.output}.raw.json`, JSON.stringify(raw, null, 2) + '\n');
    fs.writeFileSync(`${options.output}.public-exports.json`, JSON.stringify({schemaVersion: 1, provenance, ...raw.publicExports, entries: Object.entries(raw.publicExports.pathsByFunctionId).map(([rawFunctionId, paths]) => ({rawFunctionId, paths, functionName: raw.functions[rawFunctionId]?.functionName || null, source: raw.functions[rawFunctionId]?.sourceLocation || null}))}, null, 2) + '\n');
    fs.writeFileSync(`${options.output}.execution.json`, JSON.stringify({node: process.version, stdout: result.stdout,
      durationLimitMs: options.timeout || 30000, instrumentPaths: options.instrumentPaths || null}, null, 2) + '\n');
    if (invocationTrace) fs.writeFileSync(`${options.output}.invocations.json`, JSON.stringify(invocationTrace, null, 2) + '\n');
    return envelope;
  } finally {
    fs.rmSync(temporary, {recursive: true, force: true});
  }
}

module.exports = {trace};
