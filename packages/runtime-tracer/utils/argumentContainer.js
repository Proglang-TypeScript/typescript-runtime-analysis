/* global J$ */

'use strict';

const { produceMessage } = require('./kafka');

(function (sandbox) {
  function ArgumentContainer(argumentIndex, name) {
    this.argumentIndex = argumentIndex;
    this.argumentName = name;
    this.argumentId = sandbox.newTraceId('argument');

    this.interactions = [];

    this.addInteraction = function (interaction) {
      sandbox.recordObservation();
      this.interactions.push(interaction);

      const message = {
        command: 'add-interaction',
        data: {
          argumentId: this.argumentId,
          interaction,
        },
      };
      
      produceMessage(message)?.catch((err) => console.log(err));
    };


  }

  if (sandbox.utils === undefined) {
    sandbox.utils = {};
  }

  sandbox.utils.ArgumentContainer = ArgumentContainer;
})(J$);
