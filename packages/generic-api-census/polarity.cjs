const ts = require('typescript');
const classes = ['identity', 'container-element', 'value-to-container', 'multiple-arguments', 'constrained-generic', 'higher-order', 'overload-or-discriminated', 'unsupported'];
const flip = polarity => polarity === 'negative' ? 'positive' : polarity === 'positive' ? 'negative' : 'unknown';
function analyzeSignature(node, checker, {overloaded = false, kind = 'function'} = {}) {
  const ancestors = [];
  const staticMember = Boolean(ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Static);
  for (let parent = node.parent; parent; parent = parent.parent) if (ts.isClassDeclaration(parent) && !staticMember || ts.isInterfaceDeclaration(parent) || ts.isTypeAliasDeclaration(parent)) ancestors.unshift(parent);
  const bindings = new Map();
  for (const owner of [...ancestors, node]) for (const parameter of owner.typeParameters || []) bindings.set(parameter.name.text, {name: parameter.name.text, enclosing: owner !== node, enclosingKind: owner !== node ? ts.SyntaxKind[owner.kind] : null, constraint: parameter.constraint?.getText() || null});
  const occurrences = [];
  const unsupported = new Set();
  let visits = 0;
  function walk(type, polarity, argument, route, scope = bindings, substitutions = new Map(), aliases = new Set()) {
    if (!type) return;
    if (++visits > 4096) {unsupported.add('type-traversal-budget'); return;}
    if (ts.isParenthesizedTypeNode(type)) return walk(type.type, polarity, argument, route, scope, substitutions, aliases);
    if (ts.isTypeReferenceNode(type)) {
      const name = type.typeName.getText();
      if (substitutions.has(name)) {
        const remaining = new Map(substitutions);
        remaining.delete(name);
        return walk(substitutions.get(name), polarity, argument, route, scope, remaining, aliases);
      }
      if (scope.has(name) && !type.typeArguments?.length) {
        occurrences.push({variable: name, polarity, argument, route});
        return;
      }
      if (['Array', 'ReadonlyArray'].includes(name) && type.typeArguments?.length === 1) return walk(type.typeArguments[0], polarity, argument, [...route, 'array'], scope, substitutions, aliases);
      const symbol = checker?.getSymbolAtLocation(type.typeName);
      const target = symbol?.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
      const alias = target?.declarations?.find(ts.isTypeAliasDeclaration);
      if (alias && !aliases.has(alias) && aliases.size < 32) {
        const replacement = new Map(substitutions);
        (alias.typeParameters || []).forEach((parameter, index) => replacement.set(parameter.name.text, type.typeArguments?.[index] || parameter.default));
        return walk(alias.type, polarity, argument, [...route, 'alias'], scope, replacement, new Set([...aliases, alias]));
      }
      if (type.typeArguments?.length) unsupported.add(`unknown-variance:${name}`);
      for (const child of type.typeArguments || []) walk(child, 'unknown', argument, [...route, 'unknown-reference'], scope, substitutions, aliases);
      return;
    }
    if (ts.isArrayTypeNode(type)) return walk(type.elementType, polarity, argument, [...route, 'array'], scope, substitutions, aliases);
    if (ts.isTypeOperatorNode(type) && type.operator === ts.SyntaxKind.ReadonlyKeyword && ts.isArrayTypeNode(type.type)) return walk(type.type, polarity, argument, route, scope, substitutions, aliases);
    if (ts.isUnionTypeNode(type)) {for (const child of type.types) walk(child, polarity, argument, [...route, 'union'], scope, substitutions, aliases); return;}
    if (ts.isFunctionTypeNode(type) || ts.isConstructorTypeNode(type)) {
      const nested = new Map(scope);
      const nestedSubstitutions = new Map(substitutions);
      for (const parameter of type.typeParameters || []) {nested.delete(parameter.name.text); nestedSubstitutions.delete(parameter.name.text);}
      if (type.typeParameters?.length) unsupported.add('nested-generic-function');
      for (const parameter of type.parameters) walk(parameter.type, flip(polarity), argument, [...route, 'function-parameter'], nested, nestedSubstitutions, aliases);
      walk(type.type, polarity, argument, [...route, 'function-result'], nested, nestedSubstitutions, aliases);
      if (ts.isConstructorTypeNode(type)) unsupported.add('constructor-type');
      return;
    }
    if (ts.isTypeLiteralNode(type)) {
      for (const member of type.members) {
        if (ts.isCallSignatureDeclaration(member) || ts.isMethodSignature(member)) {
          const nested = new Map(scope);
          const nestedSubstitutions = new Map(substitutions);
          for (const parameter of member.typeParameters || []) {nested.delete(parameter.name.text); nestedSubstitutions.delete(parameter.name.text);}
          if (member.typeParameters?.length) unsupported.add('nested-generic-function');
          for (const parameter of member.parameters) walk(parameter.type, flip(polarity), argument, [...route, 'function-parameter'], nested, nestedSubstitutions, aliases);
          walk(member.type, polarity, argument, [...route, 'function-result'], nested, nestedSubstitutions, aliases);
        } else if (ts.isPropertySignature(member) && member.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ReadonlyKeyword)) walk(member.type, polarity, argument, [...route, 'readonly-field'], scope, substitutions, aliases);
        else {unsupported.add('mutable-or-indexed-structural-member'); if (member.type) walk(member.type, 'unknown', argument, [...route, 'unknown-member'], scope, substitutions, aliases);}
      }
      return;
    }
    if ([ts.SyntaxKind.AnyKeyword, ts.SyntaxKind.UnknownKeyword, ts.SyntaxKind.NeverKeyword, ts.SyntaxKind.VoidKeyword, ts.SyntaxKind.UndefinedKeyword, ts.SyntaxKind.StringKeyword, ts.SyntaxKind.NumberKeyword, ts.SyntaxKind.BooleanKeyword, ts.SyntaxKind.ObjectKeyword, ts.SyntaxKind.SymbolKeyword, ts.SyntaxKind.BigIntKeyword, ts.SyntaxKind.NullKeyword].includes(type.kind) || ts.isLiteralTypeNode(type)) return;
    unsupported.add(`unsupported-syntax:${ts.SyntaxKind[type.kind]}`);
    ts.forEachChild(type, child => walk(child, 'unknown', argument, [...route, 'unsupported'], scope, substitutions, aliases));
  }
  node.parameters.forEach((parameter, index) => {
    if (ts.isIdentifier(parameter.name) && parameter.name.text === 'this') unsupported.add('explicit-receiver-parameter');
    if (parameter.dotDotDotToken || !ts.isIdentifier(parameter.name)) unsupported.add('rest-or-destructured-parameter');
    walk(parameter.type, 'negative', index, []);
  });
  walk(node.type, 'positive', null, []);
  if (kind === 'constructor') unsupported.add('constructor-replay-unprepared');
  const relational = [...bindings.keys()].filter(name => occurrences.some(row => row.variable === name && row.polarity === 'negative') && occurrences.some(row => row.variable === name && row.polarity === 'positive'));
  const tags = new Set();
  const direct = row => row.route.every(step => step === 'alias' || step === 'union');
  const outerArray = row => row.route.includes('array') && row.route.every(step => ['alias', 'union', 'array'].includes(step));
  for (const name of relational) {
    const negative = occurrences.filter(row => row.variable === name && row.polarity === 'negative');
    const positive = occurrences.filter(row => row.variable === name && row.polarity === 'positive');
    if (negative.some(direct) && positive.some(direct)) tags.add('identity');
    if (negative.some(outerArray) && positive.some(direct)) tags.add('container-element');
    if (negative.some(direct) && positive.some(outerArray)) tags.add('value-to-container');
    if (new Set(negative.map(row => row.argument).filter(index => index !== null)).size > 1) tags.add('multiple-arguments');
    if (bindings.get(name).constraint) tags.add('constrained-generic');
    if ([...negative, ...positive].some(row => row.route.some(step => step.startsWith('function-')))) tags.add('higher-order');
  }
  const discriminated = node.parameters.some(parameter => parameter.type && (ts.isLiteralTypeNode(parameter.type) || ts.isUnionTypeNode(parameter.type) && parameter.type.types.some(ts.isLiteralTypeNode)));
  if (overloaded || discriminated) tags.add('overload-or-discriminated');
  if (!relational.length && !tags.size) unsupported.add('no-supported-relational-variable');
  if (relational.length && !tags.size) unsupported.add('unclassified-relational-shape');
  if (unsupported.size) tags.add('unsupported');
  return {typeParameters: [...bindings.values()], hasTypeParameters: bindings.size > 0, hasOwnTypeParameters: Boolean(node.typeParameters?.length), genericOnlyThroughEnclosing: [...bindings.values()].some(binding => ['ClassDeclaration', 'InterfaceDeclaration'].includes(binding.enclosingKind)) && !node.typeParameters?.length, bothPolarities: relational.length > 0, relationalVariables: relational, occurrences, classes: classes.filter(name => tags.has(name)), unsupportedReasons: [...unsupported].sort(), candidate: relational.length > 0 || tags.has('overload-or-discriminated'), firstOrderPotential: relational.length > 0 && !unsupported.size && !tags.has('higher-order') && kind === 'function'};
}
module.exports = {analyzeSignature, classes};
