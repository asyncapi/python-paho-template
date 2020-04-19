module.exports = ({ Nunjucks }) => {

    var _ = require('lodash');
    const TemplateUtil = require('../lib/templateUtil.js');
    const templateUtil = new TemplateUtil();

    Nunjucks.addFilter('fixType', ([name, pythonName, property]) => {

        //console.log('fixType: ' + name);
        
        let isArrayOfObjects = false;
        let isObject = false;
    
        // For message headers, type is a property.
        // For schema properties, type is a function.
        let type = property.type;
    
        if (typeof type == "function") {
          type = property.type();
        }
    
        //console.log('fixType: ' + name + ' ' + type + ' ' + JSON.stringify(property._json) + ' ' );
        //console.log("");
      
        // If a schema has a property that is a ref to another schema,
        // the type is undefined, and the title gives the title of the referenced schema.
        let ret;
        if (type === undefined) {
          if (property._json.enum) {
            ret = _.upperFirst(pythonName);
          } else {
            // check to see if it's a ref to another schema.
            ret = property._json['x-parser-schema-id'];
    
            if (!ret) {
              throw new Error("Can't determine the type of property " + name);
            }
          }
        } else if (type === 'array') {
          if (!property._json.items) {
            throw new Error("Array named " + name + " must have an 'items' property to indicate what type the array elements are.");
          }
          //console.log('fixtype: ' + JSON.stringify(property._json.items));
          let itemsType = property._json.items.type;
          if (itemsType) {
    
            if (itemsType === 'object') {
              isArrayOfObjects = true;
              itemsType = _.upperFirst(pythonName);
            } else {
              itemsType = typeMap.get(itemsType);
            }
          }
          if (!itemsType) {
            itemsType = property._json.items['x-parser-schema-id'];
    
            if (!itemsType) {
              throw new Error("Array named " + name + ": can't determine the type of the items.");
            }
          }
          ret = _.upperFirst(itemsType) + "[]";
        } else if (type === 'object') {
          isObject = true;
          ret = _.upperFirst(pythonName);
        } else {
          ret = type;
        }
        return [ret, isObject, isArrayOfObjects];
      })    

    Nunjucks.addFilter('indent1', (numTabs) => {
        return indent(numTabs);
      })
    
      Nunjucks.addFilter('indent2', (numTabs) => {
        return indent(numTabs + 1);
      })
    
      Nunjucks.addFilter('indent3', (numTabs) => {
        return indent(numTabs + 2);
      })

      Nunjucks.addFilter('identifierName', (str) => {
        return templateUtil.getIdentifierName(str);
      })
    
      Nunjucks.addFilter('upperFirst', (str) => {
        return _.upperFirst(str);
      })
    
 
      function indent(numTabs) {
        return " ".repeat(numTabs * 4);
      }    
}