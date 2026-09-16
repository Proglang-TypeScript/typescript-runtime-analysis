const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const ts = require('typescript');
const {validate, merge} = require('../trace-schema/index.cjs');
const {RuntimeInfoParser} = require('../../dist/declaration-generator/src/runtime-info/parser/RunTimeInfoParser.js');
const {TypescriptDeclarationBuilder} = require('../../dist/declaration-generator/src/typescript-declaration/builder/TypescriptDeclarationBuilder.js');
const {buildAst} = require('../../dist/declaration-generator/src/typescript-declaration/ast/buildAst.js');
const {emit} = require('../../dist/declaration-generator/src/typescript-declaration/ts-ast-utils/utils.js');
const {buildPublicObject} = require('./public-object.cjs');

function generate(files, {moduleName = 'module', publicOnly = false, output} = {}) {
  files = [...files].sort((left, right) => left.localeCompare(right));
  const traces = files.map(file => validate('trace', JSON.parse(fs.readFileSync(file, 'utf8'))));
  const publicIdentities = new Set(traces.map(trace => {
    const fields = ['package', 'version', 'repository', 'commit', 'publicModule', 'publicBoundary'];
    return JSON.stringify(Object.fromEntries(fields.map(field => [field, trace.provenance[field] || null])));
  }));
  const observations = merge(traces, {publicOnly});
  const diagnostics = [];
  const typeSets = new Map();
  for (const observation of observations) {
    if (observation.interaction.kind !== 'inputValue' && observation.position !== 'result') continue;
    const key = `${observation.functionId}:${observation.position}:${observation.index}`;
    if (!typeSets.has(key)) typeSets.set(key, new Set());
    typeSets.get(key).add(observation.type);
    if (['unknown', 'bigint', 'symbol'].includes(observation.type)) diagnostics.push({code: 'UNSUPPORTED_TYPE', functionId: observation.functionId,
      message: `Legacy inference does not support ${observation.type}`, reason: 'Retained in raw evidence; inspect inferred declaration'});
  }
  for (const [key, types] of typeSets) if (types.size > 1) diagnostics.push({code: 'EVIDENCE_CONFLICT', functionId: key,
    message: `Observed types: ${[...types].sort().join(', ')}`, reason: 'Legacy merge heuristics retained; union may lose correlations'});
  const rawFunctions = {};
  const memberPaths = new Map();
  const unfilteredPaths = new Map();
  let hasDirectRoot = false;
  let hasLegacyTarget = false;
  const seen = new Set();
  files.forEach((file, index) => {
    const run = traces[index].provenance.executionId;
    if (seen.has(run)) return;
    seen.add(run);
    const raw = JSON.parse(fs.readFileSync(`${file}.raw.json`, 'utf8'));
    const rename = value => {
      if (typeof value === 'string' && /^(functionId_|trace__)/.test(value)) return `${run}_${value}`;
      if (Array.isArray(value)) return value.map(rename);
      if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [rename(key), rename(item)]));
      return value;
    };
    for (const container of Object.values(raw.functions)) {
      if (!container.sourceLocation) continue;
      const paths = raw.publicExports?.schemaVersion === 1 ? raw.publicExports.pathsByFunctionId[container.functionId] || [] : null;
      const legacyTarget = container.requiredModule === `./${moduleName}` || container.requiredModule === moduleName;
      if (publicOnly && paths === null && legacyTarget) hasLegacyTarget = true;
      if (publicOnly && paths === null) diagnostics.push({code: 'LEGACY_PUBLIC_BOUNDARY_UNVERIFIED', functionId: container.functionId, message: `Legacy public-boundary metadata for ${container.functionName} is not independently verified`});
      if (publicOnly && (paths === null ? !legacyTarget : !paths.length)) {
        diagnostics.push({code: 'FILTERED_INTERNAL_API', functionId: container.functionId, message: `Excluded ${container.functionName}`});
        continue;
      }
      const renamed = rename(container);
      if (!publicOnly) {
        renamed.requiredModule = `./${moduleName}`;
        renamed.isExported = false;
        if (paths?.length && !paths.some(path => path.length === 0)) memberPaths.set(renamed.functionId, {paths, sourceLocation: container.sourceLocation});
        else if (!paths?.length) unfilteredPaths.set(renamed.functionId, {paths: [[container.functionName || 'anonymous']], sourceLocation: container.sourceLocation});
      } else if (paths && !paths.some(path => path.length === 0)) {
        renamed.requiredModule = `./${moduleName}`;
        renamed.isExported = false;
        memberPaths.set(renamed.functionId, {paths, sourceLocation: container.sourceLocation});
      }
      if (paths?.some(path => path.length === 0)) {
        hasDirectRoot = true;
        renamed.requiredModule = `./${moduleName}`;
        renamed.isExported = true;
      }
      rawFunctions[renamed.functionId] = renamed;
    }
  });
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'tra-generate-'));
  try {
    if (!publicOnly && memberPaths.size && !hasDirectRoot) {
      for (const [functionId, entry] of unfilteredPaths) memberPaths.set(functionId, entry);
      diagnostics.push({code: 'UNFILTERED_INTERNAL_API_APPROXIMATION',
        message: 'Functions without verified export paths are represented by source function names for the unfiltered contamination baseline'});
    }
    const input = path.join(temporary, 'legacy.json');
    fs.writeFileSync(input, JSON.stringify(rawFunctions));
    const parsed = new RuntimeInfoParser(input).parse();
    if (memberPaths.size && hasDirectRoot) {
      for (const [functionId, entry] of memberPaths) {
        parsed[functionId].requiredModule = '';
        parsed[functionId].isExported = false;
        diagnostics.push({code: 'UNSUPPORTED_PUBLIC_EXPORT_PATH', functionId, message: `Callable-root member paths ${entry.paths.map(route => route.join('.')).join(', ')} require a callable/namespace identity policy`});
      }
    }
    if (memberPaths.size && !hasDirectRoot && hasLegacyTarget) diagnostics.push({code: 'MIXED_PUBLIC_BOUNDARY_UNSUPPORTED',
      message: 'Historical required-module entries lack export paths and are withheld from path-aware object declarations'});
    if (publicOnly && memberPaths.size && publicIdentities.size > 1) diagnostics.push({code: 'INCOMPATIBLE_PUBLIC_EVIDENCE_PROVENANCE',
      message: 'Path-aware public evidence from different package/version/module boundaries cannot be merged'});
    let text;
    if (publicOnly && memberPaths.size && publicIdentities.size > 1) text = '';
    else if (memberPaths.size && !hasDirectRoot) text = buildPublicObject(parsed, memberPaths, moduleName, diagnostics);
    else text = emit(buildAst(new TypescriptDeclarationBuilder().build(parsed, moduleName)));
    if (!text && observations.length) diagnostics.push({code: 'NO_SUPPORTED_DECLARATIONS', message: 'Selected public runtime evidence had no supported declaration shape'});
    const declarationFile = path.join(temporary, 'index.d.ts');
    fs.writeFileSync(declarationFile, text);
    const compiler = ts.createProgram([declarationFile], {strict: true, noEmit: true, types: []});
    const errors = ts.getPreEmitDiagnostics(compiler);
    if (errors.length) throw new Error(ts.formatDiagnosticsWithColorAndContext(errors, {
      getCurrentDirectory: () => process.cwd(), getCanonicalFileName: name => name, getNewLine: () => '\n',
    }));
    if (!observations.length) diagnostics.push({code: 'NO_OBSERVATIONS', message: 'No runtime observations selected'});
    diagnostics.sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));
    const result = validate('declaration', {schemaVersion: 1, module: moduleName, text,
      provenance: traces.map(trace => trace.provenance).sort((left, right) => left.executionId.localeCompare(right.executionId)), diagnostics});
    if (output) {
      fs.mkdirSync(path.dirname(output), {recursive: true});
      fs.writeFileSync(output, text);
      fs.writeFileSync(`${output}.diagnostics.json`, JSON.stringify(result, null, 2) + '\n');
    }
    return result;
  } finally {
    fs.rmSync(temporary, {recursive: true, force: true});
  }
}

module.exports = {generate};
