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

    // If there are no schemas, we expect to find an anonymous one embedded in a payload. If we do have schemas we assume we don't need this.
    // This will turn out to be a bug if we ever have a file with schemas, but which also has an anonymous schema embedded in an operation.
    if (hasSchema) {
      fs.unlinkSync(path.resolve(generator.targetDir, 'payload.py'));
    }
  }
}
