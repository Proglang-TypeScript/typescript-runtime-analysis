/* global J$ */

'use strict';

const { produceMessage } = require('../../utils/kafka');
const {collectPublicExports, matchesPublicModule} = require('../../public-exports.cjs');

(function (sandbox) {
  function InvokeFunAnalysis() {
    this.callbackName = 'invokeFun';

    this.runTimeInfo = sandbox.runTimeInfo;
    this.functionsExecutionStack = sandbox.utils.functionsExecutionStack;
    this.interactionWithResultHandler = sandbox.utils.interactionWithResultHandler;
    this.wrapperObjectsHandler = sandbox.utils.wrapperObjectsHandler;
    this.metadataStore = sandbox.utils.metadataStore;
    this.functionIdHandler = sandbox.utils.functionIdHandler;

    var dis = this;

    this.callback = function (iid, f, base, args, result) {
      if (f !== undefined) {
        var functionContainer = getFunctionContainer(f);

        if (functionContainer) {
          if (dis.metadataStore.get(f, 'lastInteraction')) {
            var interaction = dis.metadataStore.get(f, 'lastInteraction');
            interaction.setReturnTypeOf(result);

            result = changeResultToWrapperObjectIfItIsALiteral(result);

            dis.interactionWithResultHandler.processInteractionWithResult(
              interaction,
              result,
              base,
            );
          }

          const lastStopped = dis.functionsExecutionStack.getLastStopped();
          functionContainer.addReturnTypeOf(
            result,
            lastStopped ? lastStopped.traceId : null,
            dis.metadataStore.get(f, 'declarationTraceId'),
          );

          if (functionContainer.isConstructor === true) {
            iterateObjectProperties(result, function (key, obj) {
              const value = obj[key];

              if (typeof value === 'function') {
                value['__CONSTRUCTED_BY__'] = functionContainer.functionId;
              }
            });
          }
          const message = {
            command: 'add-function-container',
            data: {
              functionId: functionContainer.functionId,
              functionContainer,
            },
          };
  
          // eslint-disable-next-line no-console
          produceMessage(message).catch((err) => console.log(err));

        }

        if (f.name === 'require') {
          if (matchesPublicModule(args[0], process.env.TRACE_PUBLIC_MODULE)) {
            const inventory = collectPublicExports(result, dis.functionIdHandler.getFunctionId);
            for (const [functionId, paths] of Object.entries(inventory.pathsByFunctionId)) {
              if (!sandbox.publicExports.pathsByFunctionId[functionId]) sandbox.publicExports.pathsByFunctionId[functionId] = [];
              for (const path of paths) if (!sandbox.publicExports.pathsByFunctionId[functionId].some(previous => JSON.stringify(previous) === JSON.stringify(path))) sandbox.publicExports.pathsByFunctionId[functionId].push(path);
            }
            sandbox.publicExports.exclusions.push(...inventory.exclusions);
            sandbox.publicExports.matchedRequires.push(args[0]);
          }
        }

      }

      return {
        result: result,
      };
    };

    function changeResultToWrapperObjectIfItIsALiteral(result) {
      return dis.wrapperObjectsHandler.convertToWrapperObject(result);
    }

    function getFunctionContainer(f) {
      return dis.runTimeInfo[f.functionId];
    }

    function iterateObjectProperties(obj, f) {
      for (const key in obj) {
        f(key, obj);
      }
    }
  }

  sandbox.analysis = new InvokeFunAnalysis();
})(J$);
