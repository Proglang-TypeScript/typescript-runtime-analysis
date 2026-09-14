const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const {validate} = require('../trace-schema/index.cjs');
function trial(moduleFile, exportName, plan, {trustedFixture = false, timeoutMs = 3000} = {}) {
  if (!trustedFixture && process.env.TS_ANALYSIS_ISOLATED !== '1') throw new Error('External sealing trials require isolation; trustedFixture is for checked-in first-party fixtures only');
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 30000) throw new Error('Invalid sealing timeout');
  const fallback = (status, code) => validate('trial', {schemaVersion: 1, trialId: 'not-instantiated', status, code, events: [], concreteOutcome: {status: 'unknown'}});
  if (!/^[A-Za-z_$][\w$]*$/.test(exportName)) return fallback('harness-failure', 'INVALID_EXPORT_NAME');
  let entry;
  try { entry = fs.realpathSync(moduleFile); } catch { return fallback('harness-failure', 'MISSING_MODULE'); }
  const result = spawnSync(process.execPath, ['--max-old-space-size=128', path.join(__dirname, 'worker.cjs'), entry, exportName], {input: JSON.stringify(plan), encoding: 'utf8', timeout: timeoutMs, maxBuffer: 1024 * 1024, env: {PATH: process.env.PATH, TZ: 'UTC'}});
  if (result.error?.code === 'ETIMEDOUT') return fallback('timeout', 'WORKER_DEADLINE');
  if (result.status !== 0 || result.error) return fallback('harness-failure', 'WORKER_PROCESS_FAILURE');
  try { return validate('trial', JSON.parse(result.stdout)); } catch { return fallback('harness-failure', 'WORKER_PROTOCOL_FAILURE'); }
}
function inputs(constraint = null) {
  return constraint ? [{family: 'object', value: Object.fromEntries(Object.entries(constraint.fields).map(([name, type]) => [name, type === 'string' ? 'challenge' : type === 'number' ? 17 : false]))}, {family: 'object', value: {...Object.fromEntries(Object.entries(constraint.fields).map(([name, type]) => [name, type === 'string' ? 'different' : type === 'number' ? -2 : true])), extra: 1}}] : [{family: 'number', value: 1}, {family: 'number', value: 17}, {family: 'string', value: 'seen'}, {family: 'string', value: 'challenge'}, {family: 'boolean', value: false}, {family: 'null', value: null}, {family: 'undefined'}, {family: 'object', value: {tag: 'challenge'}}, {family: 'array', value: [1, 2]}];
}
module.exports = {trial, inputs};
