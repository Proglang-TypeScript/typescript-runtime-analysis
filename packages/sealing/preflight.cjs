const ts = require('typescript');
function preflight(fn, contract) {
  const source = ts.createSourceFile('provider.js', `(${fn.toString()})`, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  if (source.parseDiagnostics.length) return 'UNSUPPORTED_FUNCTION_SOURCE';
  const expression = source.statements[0]?.expression;
  const root = expression && ts.isParenthesizedExpression(expression) ? expression.expression : expression;
  if (!root?.parameters || root.parameters.some(parameter => !ts.isIdentifier(parameter.name) || parameter.dotDotDotToken || parameter.initializer)) return 'UNSUPPORTED_PARAMETERS';
  if (root.asteriskToken || root.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.AsyncKeyword)) return 'ASYNC_OR_GENERATOR';
  const callbacks = new Set(root.parameters.filter((_, index) => contract.parameters[index]?.kind === 'function').map(parameter => parameter.name.text));
  let reason;
  const equality = new Set([ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken]);
  function visit(node) {
    if (reason) return;
    if (ts.isTypeOfExpression(node)) reason = 'TYPEOF_OBSERVABILITY';
    else if (node.kind === ts.SyntaxKind.ThisKeyword) reason = 'RECEIVER_OBSERVABILITY';
    else if (ts.isBinaryExpression(node) && equality.has(node.operatorToken.kind)) reason = 'EQUALITY_OBSERVABILITY';
    else if (ts.isIfStatement(node) || ts.isConditionalExpression(node) || ts.isSwitchStatement(node) || ts.isWhileStatement(node) || ts.isDoStatement(node) || ts.isForStatement(node) || ts.isForInStatement(node) || ts.isForOfStatement(node) || ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.ExclamationToken || ts.isBinaryExpression(node) && [ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.BarBarToken, ts.SyntaxKind.QuestionQuestionToken].includes(node.operatorToken.kind)) reason = 'CONTROL_FLOW_OBSERVABILITY';
    else if (ts.isSpreadElement(node) || ts.isSpreadAssignment(node) || ts.isDeleteExpression(node) || ts.isBinaryExpression(node) && [ts.SyntaxKind.InstanceOfKeyword, ts.SyntaxKind.InKeyword].includes(node.operatorToken.kind)) reason = 'IDENTITY_OR_PROXY_OBSERVABILITY';
    else if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression) && callbacks.has(node.expression.text)) reason = 'FUNCTION_BOUNDARY_OBSERVABILITY';
    else if (ts.isNewExpression(node) && node.expression.getText(source) !== 'Error') reason = 'UNSUPPORTED_NATIVE_CONSTRUCTION';
    else if (ts.isCallExpression(node) && !(ts.isIdentifier(node.expression) && callbacks.has(node.expression.text))) {
      const callee = node.expression.getText(source);
      reason = callee.startsWith('JSON.') ? 'SERIALIZATION_OBSERVABILITY' : callee.startsWith('Object.') || callee.startsWith('Reflect.') ? 'IDENTITY_OR_PROXY_OBSERVABILITY' : 'UNSUPPORTED_NATIVE_OR_HELPER_CALL';
    }
    ts.forEachChild(node, visit);
  }
  visit(root.body);
  return reason;
}
module.exports = {preflight};
