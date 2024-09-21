const fs = require('fs');
const path = require('path');
const _ = require('lodash');

module.exports = {
  'generate:after': generator => {
    const asyncapi = generator.asyncapi;
    let hasSchema = false;

    if (asyncapi.components()) {

      for (const schema in asyncapi.components().schemas()) {
        hasSchema = true;
        let oldName = schema + ".py";
        let newName = _.lowerFirst(oldName);
        if (newName !== schema) {
          fs.renameSync(path.resolve(generator.targetDir, oldName), path.resolve(generator.targetDir, newName));
        }
      }
    }
  }
}
