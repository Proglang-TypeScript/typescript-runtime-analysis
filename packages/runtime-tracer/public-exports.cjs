function collectPublicExports(root, getFunctionId, {maxDepth = 4, maxProperties = 1000} = {}) {
  const pathsByFunctionId = {};
  const exclusions = [];
  let inspected = 0;
  function visit(value, route, ancestors) {
    if (typeof value !== 'object' && typeof value !== 'function' || value === null) return;
    if (ancestors.has(value)) {exclusions.push({reason: 'cyclic-export-object', path: route}); return;}
    if (typeof value === 'function') {
      try {
        const functionId = getFunctionId(value);
        if (!pathsByFunctionId[functionId]) pathsByFunctionId[functionId] = [];
        if (!pathsByFunctionId[functionId].some(path => JSON.stringify(path) === JSON.stringify(route))) pathsByFunctionId[functionId].push(route);
      } catch (error) {exclusions.push({reason: 'function-identity-unavailable', path: route, detail: String(error.message).slice(0, 200)});}
    }
    if (route.length >= maxDepth) {exclusions.push({reason: 'export-depth-budget', path: route}); return;}
    let descriptors;
    try {descriptors = Object.getOwnPropertyDescriptors(value);}
    catch (error) {exclusions.push({reason: 'export-descriptor-inspection-failed', path: route, detail: String(error.message).slice(0, 200)}); return;}
    const next = new Set([...ancestors, value]);
    for (const key of Reflect.ownKeys(descriptors)) {
      if (++inspected > maxProperties) {exclusions.push({reason: 'export-property-budget', path: route}); return;}
      if (typeof key === 'symbol') {exclusions.push({reason: 'symbol-export-not-supported', path: route, detail: String(key)}); continue;}
      if (typeof value === 'function' && ['prototype', 'arguments', 'caller', 'length', 'name', 'functionId'].includes(key)) {
        if (key === 'prototype') exclusions.push({reason: 'prototype-members-not-direct-exports', path: route});
        continue;
      }
      if (key.startsWith('__TRA_') || key.startsWith('__IS_EXPORTED_FUNCTION__') || key.startsWith('__REQUIRED_MODULE__')) continue;
      const descriptor = descriptors[key];
      if (!Object.hasOwn(descriptor, 'value')) {exclusions.push({reason: 'accessor-export-not-inspected', path: [...route, key]}); continue;}
      visit(descriptor.value, [...route, key], next);
    }
  }
  visit(root, [], new Set());
  return {schemaVersion: 1, policy: 'commonjs-own-descriptor-v1', pathsByFunctionId, exclusions};
}
function matchesPublicModule(request, publicModule) {
  if (typeof request !== 'string' || typeof publicModule !== 'string' || !publicModule) return false;
  if (publicModule.startsWith('.')) return request === publicModule ||
    publicModule.endsWith('.js') && request === publicModule.slice(0, -3) ||
    request.endsWith('.js') && request.slice(0, -3) === publicModule;
  const normalized = publicModule.replace(/^\.\//, '').replace(/\.js$/, '');
  return request === './' + normalized || request === './' + normalized + '.js';
}
module.exports = {collectPublicExports, matchesPublicModule};
