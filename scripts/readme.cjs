function examples(readme) {
  return [...readme.matchAll(/^```(?:js|javascript)\s*\r?\n([\s\S]*?)^```\s*$/gm)].map(match => ({code: match[1], line: readme.slice(0, match.index).split('\n').length + 1}));
}
module.exports = {examples};
