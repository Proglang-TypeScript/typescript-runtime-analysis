/* global J$ */

'use strict';

(function (sandbox) {
  function LiteralAnalysis() {
    this.callbackName = 'literal';

    this.callback = function (iid, val) {
      if (typeof val === 'function') {
        Object.defineProperty(val, 'isInstrumented', {value: true, writable: true, configurable: true});
      }

      return {
        result: val,
      };
    };
  }

  sandbox.analysis = new LiteralAnalysis();
})(J$);
