const referenceFields = ['id', 'exportId', 'entry', 'moduleSpecifier', 'exportPath'];
function encodeShard(shard) {
  const templates = [];
  const indices = new Map();
  const references = shard.rows.map(row => {
    const template = Object.fromEntries(Object.entries(row).filter(([key]) => !referenceFields.includes(key)));
    const key = JSON.stringify(template);
    if (!indices.has(key)) {indices.set(key, templates.length); templates.push(template);}
    return {template: indices.get(key), ...Object.fromEntries(referenceFields.map(field => [field, row[field]]))};
  });
  const {rows, ...metadata} = shard;
  return {...metadata, storageVersion: 1, templates, references};
}
function decodeShard(value) {
  if (!Object.hasOwn(value, 'storageVersion')) return value;
  if (value.storageVersion !== 1 || !Array.isArray(value.templates) || !Array.isArray(value.references) || Object.hasOwn(value, 'rows')) throw new Error('Invalid compact shard envelope');
  const {storageVersion, templates, references, ...metadata} = value;
  if (templates.some(template => !template || typeof template !== 'object' || Array.isArray(template) || referenceFields.some(field => Object.hasOwn(template, field)))) throw new Error('Invalid compact shard template');
  const rows = references.map(reference => {
    if (!reference || !Number.isInteger(reference.template) || reference.template < 0 || reference.template >= templates.length || Object.keys(reference).length !== referenceFields.length + 1 || referenceFields.some(field => !Object.hasOwn(reference, field))) throw new Error('Invalid compact shard reference');
    return {...templates[reference.template], ...Object.fromEntries(referenceFields.map(field => [field, reference[field]]))};
  });
  return {...metadata, rows};
}
module.exports = {encodeShard, decodeShard};
