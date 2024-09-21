const { File } = require('@asyncapi/generator-react-sdk');
const { modelClass } = require('../partials/model-class.js')
const getImports = require('../helpers/all.js').getImports
const convertToFileName = require('../helpers/utils.js')

function generateModelCode(schemaName, schema) {
  let code = `from enum import Enum
from typing import Sequence
from entity import Entity
`;

  const code_imports = getImports(schema);
  code += code_imports + '\n';

  code += modelClass(schemaName, schema.properties(), schema.required() | [] , 0);

  return code;
}

function ModelFile({ asyncapi }) {
  const files = [];
  const schemas = asyncapi.components().schemas()

  Object.entries(schemas).forEach(([schemaName, schema]) => {
    const generatedCode = generateModelCode(schemaName, schema);
    files.push(
      <File name={`${convertToFileName(schemaName)}.py`}>
        {generatedCode}
      </File>
    );
  });
  return files;
}

module.exports = ModelFile;
