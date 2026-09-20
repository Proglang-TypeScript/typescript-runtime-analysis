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
  sandbox.observationCount = 0;
  sandbox.recordObservation = function () {
    sandbox.observationCount++;
    if (sandbox.observationCount > Number(process.env.TRACE_MAX_OBSERVATIONS || 100000)) throw new Error('Runtime observation limit exceeded');
  };
})(J$);
