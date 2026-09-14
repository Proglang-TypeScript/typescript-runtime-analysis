const path = require('node:path');
const Comparator = require('../../dist/declaration-compare/src/Comparator.js').default;
const Parser = require('../../dist/declaration-compare/src/parser/DeclarationFileParser.js').default;

function compare(expected, actual) {
  return new Comparator().compare(new Parser(path.resolve(expected)).parse(), new Parser(path.resolve(actual)).parse());
}

module.exports = {compare};
