// vim: set ts=2 sw=2 sts=2 expandtab :
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

module.exports = register => {
  register('generate:after', generator => {
    const asyncapi = generator.asyncapi;
    const info = asyncapi.info();
    //let package = generator.templateParams['javaPackage'];
    let extensions = info.extensions();

    for (schema in asyncapi.components().schemas()) {
      //console.log("schema: " + schema);
      let oldName = schema + ".py";
      let newName = _.lowerFirst(oldName);
      if (newName !== schema) {
        fs.renameSync(path.resolve(generator.targetDir, oldName), path.resolve(generator.targetDir, newName));
      }
    }
  })
}
