const _ = require('lodash');
const getTypeInfo = require('../helpers/all').getTypeInfo;
const indent1 = require('../helpers/all').indent1;
const indent2 = require('../helpers/all').indent2;
const indent3 = require('../helpers/all').indent3;
const indent4 = require('../helpers/all').indent4;

function modelClass(name, properties, required, indentLevel = 1) {
  const className = _.upperFirst(name);

  let classDefinition = `${indent1(indentLevel)}class ${className}(Entity):\n`;

  Object.entries(properties).forEach(([propName, prop]) => {
    const typeInfo = getTypeInfo([propName, prop]);

    if (typeInfo.recursive) {
      classDefinition += modelClass(
        typeInfo.innerType, typeInfo.properties, prop.required(), indentLevel + 1
      );
    } else if (typeInfo.generalType === 'enum') {
      classDefinition += `${indent2(indentLevel)}class ${typeInfo.type}(str, Enum):\n`;
      typeInfo.enum.forEach((value) => {
        classDefinition += `${indent3(indentLevel)}${value} = '${value}'\n`;
      });
      classDefinition += `${indent2(indentLevel)}\n`;
    }
  });

  classDefinition += `${indent2(indentLevel)}def __init__(self,\n`;

  Object.entries(properties).forEach(([propName, prop], index) => {
    const typeInfo = getTypeInfo([propName, prop]);
    const separator = index === 0 ? '' : ',\n';
    classDefinition += `${separator}${indent4(indentLevel)}${typeInfo.pythonName}: ${typeInfo.pythonType}`;
  });

  classDefinition += `):\n`;

  Object.entries(properties).forEach(([propName, prop]) => {
    const typeInfo = getTypeInfo([propName, prop]);
    classDefinition += `${indent3(indentLevel)}self.${typeInfo.pythonName} = ${typeInfo.pythonName}\n`;
  });

  if (Object.keys(properties).length === 0) {
    classDefinition += `${indent3(indentLevel)}pass\n`;
  }

  classDefinition += `${indent1(indentLevel)}\n`;
  return classDefinition;
}

module.exports = { modelClass }
