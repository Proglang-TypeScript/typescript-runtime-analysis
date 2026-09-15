const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const ts = require('typescript');
const {validate, merge} = require('../trace-schema/index.cjs');
const {RuntimeInfoParser} = require('../../dist/declaration-generator/src/runtime-info/parser/RunTimeInfoParser.js');
const {TypescriptDeclarationBuilder} = require('../../dist/declaration-generator/src/typescript-declaration/builder/TypescriptDeclarationBuilder.js');
const {buildAst} = require('../../dist/declaration-generator/src/typescript-declaration/ast/buildAst.js');
const {emit} = require('../../dist/declaration-generator/src/typescript-declaration/ts-ast-utils/utils.js');

function generate(files, {moduleName = 'module', publicOnly = false, output} = {}) {
  files = [...files].sort((left, right) => left.localeCompare(right));
  const traces = files.map(file => validate('trace', JSON.parse(fs.readFileSync(file, 'utf8'))));
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
      if (publicOnly && paths === null) diagnostics.push({code: 'LEGACY_PUBLIC_BOUNDARY_UNVERIFIED', functionId: container.functionId, message: `Legacy public-boundary metadata for ${container.functionName} is not independently verified`});
      if (publicOnly && (paths === null ? !legacyTarget : !paths.length)) {
        diagnostics.push({code: 'FILTERED_INTERNAL_API', functionId: container.functionId, message: `Excluded ${container.functionName}`});
        continue;
      }
      if (publicOnly && paths && !paths.some(path => path.length === 0)) {
        diagnostics.push({code: 'UNSUPPORTED_PUBLIC_EXPORT_PATH', functionId: container.functionId, message: `Public property paths for ${container.functionName}: ${paths.map(path => path.join('.')).join(', ')}`, reason: 'Legacy declaration builder cannot preserve object-member/re-export paths; retain evidence without flattening into a root function'});
        continue;
      }
      const renamed = rename(container);
      if (publicOnly && paths?.some(path => path.length === 0)) {
        renamed.requiredModule = `./${moduleName}`;
        renamed.isExported = true;
      }
      rawFunctions[renamed.functionId] = renamed;
    }
  });
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'tra-generate-'));
  try {
    const input = path.join(temporary, 'legacy.json');
    fs.writeFileSync(input, JSON.stringify(rawFunctions));
    const parsed = new RuntimeInfoParser(input).parse();
    const text = emit(buildAst(new TypescriptDeclarationBuilder().build(parsed, moduleName)));
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
