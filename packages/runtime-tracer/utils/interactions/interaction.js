/* global J$ */

'use strict';

(function (sandbox) {
  function Interaction() {
    this.code = null;
    this.traceId = null;
    this.interactionId = sandbox.newTraceId('interaction');
  }

  if (sandbox.utils === undefined) {
    sandbox.utils = {};
  }

  sandbox.utils.Interaction = Interaction;
})(J$);
