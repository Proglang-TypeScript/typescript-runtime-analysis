const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ts = require('typescript');
const {analyzeSignature, classes} = require('./polarity.cjs');
const hash = text => crypto.createHash('sha256').update(text).digest('hex');
const within = (root, file) => {const relative = path.relative(root, file); return relative === '' || !relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative);};
function entryPoints(manifest) {
  const entries = [{path: manifest.types || manifest.typings || 'index.d.ts', subpath: '', condition: 'primary'}];
  function visit(value, subpath, condition) {
    if (typeof value === 'string') {
      if (/\.d\.(?:ts|mts|cts)$/.test(value)) entries.push({path: value, subpath, condition});
      return;
    }
    if (value && typeof value === 'object') for (const [key, child] of Object.entries(value)) if (!key.startsWith('types@')) visit(child, subpath, condition + '/' + key);
  }
  if (manifest.exports && typeof manifest.exports === 'object') for (const [subpath, value] of Object.entries(manifest.exports)) if (subpath.startsWith('.') && !subpath.includes('*')) visit(value, subpath === '.' ? '' : subpath.slice(2), 'exports');
  const seen = new Set();
  return entries.filter(entry => {const key = entry.path.replace(/^\.\//, '').replace(/\.d\.ts$/, '') + ':' + entry.subpath; if (seen.has(key)) return false; seen.add(key); return true;});
}
function analyzePackage(root, directory, entryOption) {
  const typesRoot = path.join(root, 'types');
  const packageRoot = path.join(typesRoot, directory);
  let manifest = {};
  if (fs.existsSync(path.join(packageRoot, 'package.json'))) manifest = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
  if (!entryOption) {
    const results = entryPoints(manifest).map(entry => analyzePackage(root, directory, entry));
    const first = results[0].package;
    const diagnostics = [...new Map(results.flatMap(result => result.package.diagnostics).map(diagnostic => [JSON.stringify(diagnostic), diagnostic])).values()];
    return {package: {...first, entries: results.map(result => ({entry: result.package.entry, subpath: result.package.subpath, condition: result.package.condition, status: result.package.status, entrySha256: result.package.entrySha256})), diagnosticCount: results.reduce((total, result) => total + (result.package.diagnosticCount || 0), 0), retainedDiagnosticCount: diagnostics.length, diagnostics, sourceNotices: Object.assign({}, ...results.map(result => result.package.sourceNotices || {})), exclusions: results.flatMap(result => result.package.exclusions), status: results.some(result => result.package.status === 'missing-entry') ? 'missing-entry' : diagnostics.length ? 'extracted-with-diagnostics' : 'extracted'}, rows: [...new Map(results.flatMap(result => result.rows).map(row => [row.id, row])).values()].sort((left, right) => left.id.localeCompare(right.id))};
  }
  const requestedEntry = path.resolve(packageRoot, entryOption.path);
  if (!within(packageRoot, requestedEntry)) throw new Error('Invalid declaration entry point');
  const candidates = [requestedEntry, requestedEntry + '.d.ts', path.join(requestedEntry, 'index.d.ts')].filter(file => /\.d\.(?:ts|mts|cts)$/.test(file));
  const entry = candidates.find(file => fs.existsSync(file)) || candidates[0];
  if (!entry) throw new Error('Invalid declaration entry point');
  const packageRecord = {directory, declarationPackage: manifest.name || `@types/${directory}`, declarationVersion: manifest.version || null, owners: manifest.owners || [], projects: manifest.projects || [], runtimePackage: directory === 'node' || manifest.nonNpm ? null : directory.includes('__') ? '@' + directory.replace('__', '/') : directory, runtimeAvailability: 'not-assessed', runtimeExecution: 'not-assessed', entry: path.relative(root, entry).split(path.sep).join('/'), subpath: entryOption.subpath, condition: entryOption.condition, variants: {typesVersions: manifest.typesVersions || null, exports: manifest.exports || null}, diagnostics: [], exclusions: []};
  if (manifest.typesVersions) packageRecord.exclusions.push({reason: 'alternate-typesVersions-not-selected', detail: 'Only unversioned/current declared entry branches are analyzed; version-conditional alternates require review'});
  if (manifest.exports && JSON.stringify(manifest.exports).includes('*')) packageRecord.exclusions.push({reason: 'wildcard-export-expansion-not-supported'});
  let moduleSpecifier = (packageRecord.runtimePackage || packageRecord.declarationPackage) + (entryOption.subpath ? '/' + entryOption.subpath : '');
  if (!fs.existsSync(entry)) return {package: {...packageRecord, status: 'missing-entry'}, rows: []};
  const options = {target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, strict: true, types: [], noEmit: true, skipLibCheck: false};
  const host = ts.createCompilerHost(options);
  host.resolveModuleNames = (names, containing) => names.map(name => {
    const resolved = ts.resolveModuleName(name, containing, options, host).resolvedModule;
    if (resolved && within(typesRoot, resolved.resolvedFileName) && !resolved.resolvedFileName.split(path.sep).includes('node_modules')) return resolved;
    if (name.startsWith('.')) return undefined;
    const parts = name.split('/');
    const scoped = name.startsWith('@');
    const folder = scoped ? parts.slice(0, 2).join('__').slice(1) : parts[0];
    const subpath = parts.slice(scoped ? 2 : 1).join('/');
    for (const candidate of [path.join(typesRoot, folder, subpath || 'index') + '.d.ts', path.join(typesRoot, folder, subpath, 'index.d.ts')]) if (within(typesRoot, candidate) && fs.existsSync(candidate)) return {resolvedFileName: candidate, extension: ts.Extension.Dts, isExternalLibraryImport: true};
    return undefined;
  });
  host.resolveTypeReferenceDirectives = names => names.map(reference => {
    const name = typeof reference === 'string' ? reference : reference.fileName;
    if (!/^[a-z0-9][a-z0-9_.-]*$/.test(name)) return undefined;
    const file = path.join(typesRoot, name, 'index.d.ts');
    return fs.existsSync(file) ? {resolvedFileName: file, primary: true} : undefined;
  });
  const program = ts.createProgram([entry], options, host);
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(entry);
  const rows = new Map();
  packageRecord.sourceNotices = {};
  const seen = new Set();
  let visitedExports = 0;
  function location(node) {
    const file = node.getSourceFile();
    const start = node.getStart(file);
    const position = file.getLineAndCharacterOfPosition(start);
    return {file: path.relative(root, file.fileName).split(path.sep).join('/'), start, line: position.line + 1, column: position.character + 1};
  }
  function add(type, exportPath, kind, runtimeBinding) {
    const signatures = checker.getSignaturesOfType(type, kind === 'constructor' ? ts.SignatureKind.Construct : ts.SignatureKind.Call);
    for (const signature of signatures) {
      const node = signature.getDeclaration();
      if (!node || !node.parameters || !within(typesRoot, node.getSourceFile().fileName)) continue;
      const sourceLocation = location(node);
      if (!packageRecord.sourceNotices[sourceLocation.file]) {
        const file = node.getSourceFile();
        packageRecord.sourceNotices[sourceLocation.file] = {sha256: hash(fs.readFileSync(file.fileName)), leadingComments: file.text.slice(0, file.statements[0]?.getStart(file) || 0), attributionComments: (file.text.match(/\/\*[\s\S]*?\*\//g) || []).filter(comment => /copyright|licen[cs]e|\bauthors?\b|originates from/i.test(comment))};
      }
      const declarationId = hash(`${sourceLocation.file}:${sourceLocation.start}`);
      if (ts.getCombinedModifierFlags(node) & (ts.ModifierFlags.Private | ts.ModifierFlags.Protected)) continue;
      const exportId = hash(`${directory}:${moduleSpecifier}:${exportPath.join('.')}:${kind}:${runtimeBinding}`);
      const id = hash(`${exportId}:${declarationId}`);
      if (rows.has(id)) continue;
      const classification = analyzeSignature(node, checker, {overloaded: signatures.length > 1, kind});
      rows.set(id, {id, declarationId, exportId, package: directory, entry: packageRecord.entry, moduleSpecifier, exportPath, kind, runtimeBinding, source: sourceLocation, declaration: node.getText(), overloadCount: signatures.length, extractionReason: 'Callable signature reachable from a public module export or exported type member', ...classification, firstOrderPotential: classification.firstOrderPotential && !classification.typeParameters.some(parameter => parameter.enclosing), contextNote: classification.typeParameters.some(parameter => parameter.enclosing) ? 'Counts describe the formal source declaration; a free runtime generic is not established for an enclosing/specialized export context' : null, runtimeExecution: 'not-assessed'});
    }
  }
  function publicMember(symbol) {
    return !(symbol.declarations || []).some(node => ts.getCombinedModifierFlags(node) & (ts.ModifierFlags.Private | ts.ModifierFlags.Protected) || node.name && ts.isPrivateIdentifier(node.name));
  }
  function members(type, exportPath, runtimeBinding, depth) {
    for (const member of checker.getPropertiesOfType(type)) {
      if (!publicMember(member) || ['prototype', 'constructor'].includes(member.name)) continue;
      const node = member.valueDeclaration || member.declarations?.[0];
      if (!node || !within(typesRoot, node.getSourceFile().fileName)) continue;
      const memberType = checker.getTypeOfSymbolAtLocation(member, node);
      const property = node.name && ts.isComputedPropertyName(node.name) ? '[' + node.name.expression.getText() + ']' : member.name;
      const memberPath = [...exportPath, property];
      add(memberType, memberPath, 'method', runtimeBinding);
      if (depth < 2 && !checker.getSignaturesOfType(memberType, ts.SignatureKind.Call).length && memberType.flags & ts.TypeFlags.Object) members(memberType, memberPath, runtimeBinding, depth + 1);
    }
  }
  function walk(symbol, exportPath, rootExpression, inheritedBinding, ancestors = new Set()) {
    if (++visitedExports > 100000) throw new Error(`Export traversal budget exceeded: ${directory}`);
    const typeOnlyAlias = (symbol.declarations || []).some(node => ts.isExportSpecifier(node) && (node.isTypeOnly || node.parent.parent.isTypeOnly));
    if (symbol.flags & ts.SymbolFlags.Alias) symbol = checker.getAliasedSymbol(symbol);
    if (ancestors.has(symbol)) {
      packageRecord.exclusions.push({reason: 'recursive-namespace-alias', exportPath, moduleSpecifier});
      return;
    }
    const key = moduleSpecifier + ':' + exportPath.join('.') + ':' + symbol.name + ':' + symbol.declarations?.[0]?.pos;
    if (seen.has(key)) return;
    if (exportPath.length > 16) throw new Error(`Namespace traversal depth exceeded: ${directory}`);
    seen.add(key);
    const node = symbol.valueDeclaration || symbol.declarations?.[0] || source;
    const binding = typeOnlyAlias || inheritedBinding === 'type-only' ? 'type-only' : symbol.flags & ts.SymbolFlags.Value ? 'value' : 'type-only';
    const valueType = rootExpression ? checker.getTypeAtLocation(rootExpression) : checker.getTypeOfSymbolAtLocation(symbol, node);
    add(valueType, exportPath, 'function', binding);
    add(valueType, exportPath, 'constructor', binding);
    if (symbol.flags & ts.SymbolFlags.TypeAlias) {
      const declared = checker.getDeclaredTypeOfSymbol(symbol);
      add(declared, exportPath, 'function', 'type-only');
      add(declared, exportPath, 'constructor', 'type-only');
    }
    if (symbol.flags & (ts.SymbolFlags.Interface | ts.SymbolFlags.Class)) {
      const instance = checker.getDeclaredTypeOfSymbol(symbol);
      if (symbol.flags & ts.SymbolFlags.Interface) {add(instance, exportPath, 'function', 'type-only'); add(instance, exportPath, 'constructor', 'type-only');}
      members(instance, exportPath, symbol.flags & ts.SymbolFlags.Class && binding !== 'type-only' ? 'instance' : 'type-only', 0);
    }
    if (symbol.flags & ts.SymbolFlags.Value && (!(symbol.flags & ts.SymbolFlags.Module) || rootExpression && valueType.symbol !== symbol)) members(valueType, exportPath, binding, 0);
    if (symbol.flags & ts.SymbolFlags.Module) {
      const nested = new Set([...ancestors, symbol]);
      for (const child of checker.getExportsOfModule(symbol)) walk(child, [...exportPath, child.name], null, binding, nested);
    }
  }
  const exportEquals = source.statements.find(statement => ts.isExportAssignment(statement) && statement.isExportEquals);
  if (exportEquals) {
    const symbol = checker.getSymbolAtLocation(exportEquals.expression);
    if (symbol) walk(symbol, [], exportEquals.expression);
    else packageRecord.exclusions.push({reason: 'unresolved-export-equals'});
  } else if (ts.isExternalModule(source)) {
    const symbol = checker.getSymbolAtLocation(source);
    if (symbol) for (const exported of checker.getExportsOfModule(symbol)) walk(exported, [exported.name]);
  } else {
    for (const file of program.getSourceFiles()) if (within(packageRoot, file.fileName) && !ts.isExternalModule(file)) {
      for (const statement of file.statements) if (ts.isModuleDeclaration(statement) && ts.isStringLiteral(statement.name)) {
        moduleSpecifier = statement.name.text;
        const symbol = checker.getSymbolAtLocation(statement.name);
        if (symbol) for (const exported of checker.getExportsOfModule(symbol)) walk(exported, [exported.name]);
      }
    }
    packageRecord.exclusions.push({reason: 'global-declarations-not-in-module-export-denominator'});
  }
  let diagnostics = [...program.getOptionsDiagnostics(), ...program.getSyntacticDiagnostics()];
  for (const file of program.getSourceFiles()) {
    if (!within(typesRoot, file.fileName)) continue;
    diagnostics.push(...program.getSemanticDiagnostics(file));
    if (!within(packageRoot, file.fileName)) continue;
    function inspect(node) {
      if (ts.isModuleDeclaration(node) && (node.flags & ts.NodeFlags.GlobalAugmentation || ts.isStringLiteral(node.name) && ts.isExternalModule(file))) packageRecord.exclusions.push({reason: 'global-or-module-augmentation', source: location(node)});
      ts.forEachChild(node, inspect);
    }
    inspect(file);
  }
  packageRecord.diagnosticCount = diagnostics.length;
  packageRecord.diagnostics = diagnostics.slice(0, 200).map(diagnostic => ({code: diagnostic.code, category: ts.DiagnosticCategory[diagnostic.category], message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'), ...(diagnostic.file ? {file: path.relative(root, diagnostic.file.fileName).split(path.sep).join('/'), start: diagnostic.start} : {})}));
  packageRecord.status = diagnostics.length ? 'extracted-with-diagnostics' : 'extracted';
  packageRecord.entrySha256 = hash(fs.readFileSync(entry));
  return {package: packageRecord, rows: [...rows.values()].sort((left, right) => left.id.localeCompare(right.id))};
}
function summarize(packages, rows) {
  const distinct = (predicate, key = 'declarationId') => new Set(rows.filter(predicate).map(row => row[key])).size;
  return {selectedPackages: packages.length, packagesWithExports: distinct(() => true, 'package'), packagesWithTypeParameters: distinct(row => row.hasTypeParameters, 'package'), packagesWithBothPolarities: distinct(row => row.bothPolarities, 'package'), packagesWithoutDiagnostics: packages.filter(row => row.status === 'extracted').length, totalExportedCallableDeclarations: distinct(() => true), exportSignaturePairs: rows.length, distinctCallableExports: distinct(() => true, 'exportId'), declarationsWithTypeParameters: distinct(row => row.hasTypeParameters), declarationsWithBothPolarities: distinct(row => row.bothPolarities), genericOnlyThroughEnclosing: distinct(row => row.genericOnlyThroughEnclosing), classCounts: Object.fromEntries(classes.map(name => [name, distinct(row => row.classes.includes(name))])), firstOrderPotentialDeclarations: distinct(row => row.firstOrderPotential), obtainableRuntimePackages: packages.filter(row => row.runtimeAvailability === 'metadata-available').length, verifiedExecutableExports: distinct(row => row.runtimeExecution === 'verified-loaded-and-exercised', 'exportId'), runtimeNotAssessedExports: distinct(row => row.runtimeExecution === 'not-assessed', 'exportId')};
}
function census(root, directories, provenance) {
  root = fs.realpathSync(root);
  const available = fs.readdirSync(path.join(root, 'types'), {withFileTypes: true}).filter(entry => entry.isDirectory()).map(entry => entry.name).sort();
  const selected = directories?.length ? [...new Set(directories)].sort() : available;
  if (selected.some(name => !/^[a-z0-9][a-z0-9_.-]*$/.test(name) || !available.includes(name))) throw new Error('Unknown or invalid census package directory');
  const packages = [];
  const rows = [];
  for (const directory of selected) {
    const result = analyzePackage(root, directory);
    packages.push(result.package);
    rows.push(...result.rows);
  }
  return {schemaVersion: 1, provenance, compiler: ts.version, analysisPolicy: 'declared-entry-module-exports-v1', coverage: {selection: selected, availableCheckoutPackages: available.length, fullPinnedCorpus: !directories?.length && provenance.scope === 'full'}, packages, rows, summary: summarize(packages, rows)};
}
module.exports = {census, analyzePackage, analyzeSignature, summarize, entryPoints, classes, hash};
