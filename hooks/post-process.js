const fs = require('fs');
const path = require('path');
const _ = require('lodash');

module.exports = register => {
  register('generate:after', generator => {
    const asyncapi = generator.asyncapi;

    for (schema in asyncapi.components().schemas()) {
      let oldName = schema + ".py";
      let newName = _.lowerFirst(oldName);
      if (newName !== schema) {
        fs.renameSync(path.resolve(generator.targetDir, oldName), path.resolve(generator.targetDir, newName));
      }
    }
  })
}
