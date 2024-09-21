function modelClass(name, properties, required, indentLevel) {
    const className = upperFirst(name);
    const indent1 = indent(indentLevel);
    const indent2 = indent(indentLevel + 1);
    const indent3 = indent(indentLevel + 2);
    const indent4 = indent(indentLevel + 3);
  
    let output = `${indent1}class ${className}(Entity):\n`;
  
    // Render nested classes and enums
    for (const [propName, prop] of Object.entries(properties)) {
      const typeInfo = getTypeInfo([propName, prop]);
      if (typeInfo.recursive) {
        output += modelClass(typeInfo.innerType, typeInfo.properties, prop.required(), indentLevel + 1);
      } else if (typeInfo.generalType === 'enum') {
        output += `${indent2}class ${typeInfo.type}(str, Enum):\n`;
        for (const v of typeInfo.enum) {
          output += `${indent3}${v} = '${v}'\n`;
        }
      }
    }
  
    // Render __init__ method
    output += `${indent2}def __init__(\n`;
    output += `${indent4}self`;
  
    for (const [propName, prop] of Object.entries(properties)) {
      const typeInfo = getTypeInfo([propName, prop]);
      output += `,\n${indent4}${typeInfo.pythonName}${typeInfo.pythonType ? ': ' + typeInfo.pythonType : ''}`;
    }
    output += '\n' + indent2 + '):\n';
  
    // Render __init__ body
    const initBody = Object.entries(properties).map(([propName, prop]) => {
      const typeInfo = getTypeInfo([propName, prop]);
      return `${indent3}self.${typeInfo.pythonName} = ${typeInfo.pythonName}`;
    });
  
    if (initBody.length > 0) {
      output += initBody.join('\n') + '\n';
    } else {
      output += indent3 + 'pass\n';
    }
  
    return output;
  }

  module.exports = modelClass;