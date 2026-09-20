/* global J$ */

'use strict';

(function (sandbox) {
  sandbox.runTimeInfo = {};
  sandbox.publicExports = {schemaVersion: 1, policy: 'commonjs-own-descriptor-v1', pathsByFunctionId: {}, exclusions: [], matchedRequires: []};
  sandbox.transparentTracing = process.env.TRACE_TRANSPARENT === '1';
  var nextTraceId = 0;
  sandbox.newTraceId = function (prefix) {
    nextTraceId++;
    return prefix + '-' + nextTraceId;
  };
  var observationLimit = Number(process.env.TRACE_MAX_OBSERVATIONS || 100000);
  var truncateObservations = process.env.TRACE_TRUNCATE_OBSERVATIONS === '1';
  var sampleEvery = Number(process.env.TRACE_SAMPLE_EVERY || 1000);
  sandbox.observationBudget = {limit: observationLimit, seen: 0, retained: 0, dropped: 0, sampleEvery: truncateObservations ? sampleEvery : null, truncated: false};
  sandbox.recordObservation = function () {
    sandbox.observationBudget.seen++;
    if (sandbox.observationBudget.seen <= observationLimit || truncateObservations && (sandbox.observationBudget.seen - observationLimit) % sampleEvery === 0) {
      sandbox.observationBudget.retained++;
      return true;
    }
    sandbox.observationBudget.dropped++;
    sandbox.observationBudget.truncated = true;
    if (truncateObservations) return false;
    throw new Error('Runtime observation limit exceeded');
  };
})(J$);
