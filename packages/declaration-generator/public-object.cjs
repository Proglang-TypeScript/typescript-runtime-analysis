const ts = require('typescript');
const {TypescriptDeclarationBuilder} = require('../../dist/declaration-generator/src/typescript-declaration/builder/TypescriptDeclarationBuilder.js');
const {createParameter} = require('../../dist/declaration-generator/src/typescript-declaration/ast/helpers/createParameter.js');
const {createReturnType} = require('../../dist/declaration-generator/src/typescript-declaration/ast/helpers/createReturnType.js');
const {emit} = require('../../dist/declaration-generator/src/typescript-declaration/ts-ast-utils/utils.js');

function supportedType(type) {
  if (!type) return false;
  if (type.kind === 'KEYWORD' || type.kind === 'LITERAL_TYPE') return true;
  if (type.kind === 'ARRAY') return supportedType(type.value);
  if (type.kind === 'UNION') return type.value.every(supportedType);
  return false;
}

function buildPublicObject(parsed, memberPaths, moduleName, diagnostics) {
  const groups = new Map();
  for (const [functionId, entry] of memberPaths) {
    const info = parsed[functionId];
    if (!info) continue;
    if (info.isConstructor) {
      diagnostics.push({code: 'UNSUPPORTED_MEMBER_SIGNATURE', functionId, message: 'Constructor-valued object member requires a constructor identity policy'});
      continue;
    }
    const declaration = new TypescriptDeclarationBuilder().build({[functionId]: info}, moduleName);
    const signatures = declaration.functions || [];
    if (!signatures.length || declaration.interfaces?.length || declaration.classes?.length ||
        signatures.some(signature => !supportedType(signature.returnType) || signature.parameters?.some(parameter => !supportedType(parameter.type)))) {
      diagnostics.push({code: 'UNSUPPORTED_MEMBER_SIGNATURE', functionId, message: 'No supported keyword/literal/union/array signature without dependent interfaces or classes'});
      continue;
    }
    const source = JSON.stringify(entry.sourceLocation);
    for (const route of entry.paths) {
      if (!route.length || !route.every(segment => typeof segment === 'string')) continue;
      const key = JSON.stringify(route);
      if (!groups.has(key)) groups.set(key, {route, sources: new Set(), signatures: []});
      const group = groups.get(key);
      group.sources.add(source);
      group.signatures.push(...signatures);
    }
  }
  const candidates = [...groups.values()].sort((left, right) => JSON.stringify(left.route).localeCompare(JSON.stringify(right.route)));
  const blocked = new Set();
  for (const group of candidates) {
    if (group.sources.size > 1) {
      blocked.add(JSON.stringify(group.route));
      diagnostics.push({code: 'CONFLICTING_PUBLIC_EXPORT_BINDING', message: `Different source functions observed at ${group.route.join('.')}`});
    }
    for (const other of candidates) {
      if (other === group || other.route.length <= group.route.length) continue;
      if (group.route.every((segment, index) => segment === other.route[index])) {
        blocked.add(JSON.stringify(group.route));
        blocked.add(JSON.stringify(other.route));
        diagnostics.push({code: 'CONFLICTING_PUBLIC_EXPORT_SHAPE', message: `Callable and nested object paths collide at ${group.route.join('.')}`});
      }
    }
  }
  const tree = {children: new Map(), signatures: []};
  for (const group of candidates) {
    if (blocked.has(JSON.stringify(group.route))) continue;
    let node = tree;
    for (const segment of group.route) {
      if (!node.children.has(segment)) node.children.set(segment, {children: new Map(), signatures: []});
      node = node.children.get(segment);
    }
    const seen = new Set(node.signatures.map(signature => JSON.stringify(signature)));
    for (const signature of group.signatures) {
      const key = JSON.stringify(signature);
      if (!seen.has(key)) {node.signatures.push(signature); seen.add(key);}
    }
  }
  if (!tree.children.size) return '';
  function members(node) {
    return [...node.children.entries()].sort(([left], [right]) => left.localeCompare(right)).flatMap(([name, child]) => {
      const propertyName = ts.factory.createStringLiteral(name);
      if (child.signatures.length) return child.signatures.map(signature => ts.factory.createMethodSignature(
        undefined, propertyName, undefined, undefined,
        (signature.parameters || []).map(parameter => createParameter(parameter)),
        createReturnType(signature)));
      return [ts.factory.createPropertySignature(undefined, propertyName, undefined, ts.factory.createTypeLiteralNode(members(child)))];
    });
  }
  const sourceFile = ts.createSourceFile('index.d.ts', '', ts.ScriptTarget.ES2020, true, ts.ScriptKind.TS);
  const declaration = ts.factory.createVariableStatement(
    [ts.factory.createModifier(ts.SyntaxKind.DeclareKeyword)],
    ts.factory.createVariableDeclarationList(
      [ts.factory.createVariableDeclaration('Module', undefined, ts.factory.createTypeLiteralNode(members(tree)), undefined)],
      ts.NodeFlags.Const));
  const assignment = ts.factory.createExportAssignment(undefined, true, ts.factory.createIdentifier('Module'));
  return emit(ts.factory.updateSourceFile(sourceFile, [declaration, assignment]));
}

module.exports = {buildPublicObject};
