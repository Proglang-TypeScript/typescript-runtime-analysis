const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const ts = require('typescript');

const [runRoot, referenceRoot, clientRoot, output] = process.argv.slice(2);
if (!runRoot || !referenceRoot || !clientRoot || !output) throw new Error(
  'Usage: node scripts/line-a-pilot-evaluate.cjs RUN_ROOT DEFINITELY_TYPED_ROOT CLIENT_ROOT OUTPUT.json');
const configurations = ['README-only', 'tests-only', 'union', 'filtered-union'];
const expectations = JSON.parse(fs.readFileSync(path.join(clientRoot, 'client-expectations.json'), 'utf8'));

function propertyName(node) {
  if (!node) return '';
  if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node)) return node.text;
  return node.getText();
}

function add(paths, route) {
  const key = route.join('.');
  paths.set(key, (paths.get(key) || 0) + 1);
}

function typeMembers(type, prefix, paths) {
  if (!type || !ts.isTypeLiteralNode(type)) return;
  for (const member of type.members) {
    const name = propertyName(member.name);
    if (!name) continue;
    if (ts.isMethodSignature(member)) add(paths, [...prefix, name]);
    else if (ts.isPropertySignature(member)) typeMembers(member.type, [...prefix, name], paths);
  }
}

function namespaceFunctions(body, prefix, paths) {
  if (!body) return;
  const statements = ts.isModuleBlock(body) ? body.statements : [body];
  for (const statement of statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name) add(paths, [...prefix, statement.name.text]);
    else if (ts.isModuleDeclaration(statement)) namespaceFunctions(statement.body, [...prefix, propertyName(statement.name)], paths);
  }
}

function callablePaths(file) {
  const text = fs.readFileSync(file, 'utf8');
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const paths = new Map();
  let target = '';
  for (const statement of source.statements) {
    if (ts.isExportAssignment(statement) && ts.isIdentifier(statement.expression)) target = statement.expression.text;
  }
  for (const statement of source.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name?.text === target) add(paths, []);
    if (ts.isModuleDeclaration(statement) && propertyName(statement.name) === target) namespaceFunctions(statement.body, [], paths);
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (propertyName(declaration.name) === target) typeMembers(declaration.type, [], paths);
      }
    }
  }
  return Object.fromEntries([...paths].sort(([left], [right]) => left.localeCompare(right)));
}

function clientResult(declaration, client) {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'tra-line-a-client-'));
  try {
    fs.copyFileSync(declaration, path.join(temporary, 'index.d.ts'));
    fs.copyFileSync(client, path.join(temporary, 'client.ts'));
    const program = ts.createProgram([path.join(temporary, 'client.ts')], {
      strict: true, noEmit: true, types: [], module: ts.ModuleKind.Node16,
      moduleResolution: ts.ModuleResolutionKind.Node16,
    });
    const errors = ts.getPreEmitDiagnostics(program).map(error => ts.flattenDiagnosticMessageText(error.messageText, '\n'));
    return {pass: errors.length === 0, errors};
  } finally {
    fs.rmSync(temporary, {recursive: true, force: true});
  }
}

function score(expected, actual) {
  const expectedPaths = new Set(Object.keys(expected));
  const actualPaths = new Set(Object.keys(actual));
  const matched = [...actualPaths].filter(item => expectedPaths.has(item)).length;
  return {
    expectedPaths: expectedPaths.size,
    generatedPaths: actualPaths.size,
    matchedPaths: matched,
    recall: expectedPaths.size ? matched / expectedPaths.size : null,
    precision: actualPaths.size ? matched / actualPaths.size : null,
  };
}

const result = {schemaVersion: 1, metric: 'provisional-callable-path-v1', packages: []};
for (const packageName of Object.keys(expectations).sort()) {
  const reference = path.join(referenceRoot, 'types', packageName, 'index.d.ts');
  const expectedPaths = callablePaths(reference);
  const variants = [{configuration: 'reference-candidate', file: reference},
    ...configurations.map(configuration => ({configuration, file: path.join(runRoot, packageName, configuration, 'index.d.ts')}))];
  const rows = variants.map(variant => {
    const actualPaths = callablePaths(variant.file);
    const clients = Object.fromEntries(Object.entries(expectations[packageName]).map(([name, expected]) => {
      const observed = clientResult(variant.file, path.join(clientRoot, 'clients', name));
      return [name, {expected, ...observed, correct: expected === observed.pass}];
    }));
    return {configuration: variant.configuration, callablePaths: actualPaths,
      pathScore: score(expectedPaths, actualPaths),
      clientChecks: clients,
      clientScore: {correct: Object.values(clients).filter(item => item.correct).length, total: Object.keys(clients).length}};
  });
  result.packages.push({package: packageName, referenceCallablePaths: expectedPaths, configurations: rows});
}
fs.mkdirSync(path.dirname(output), {recursive: true});
fs.writeFileSync(output, JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
