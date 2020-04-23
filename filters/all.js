module.exports = ({ Nunjucks }) => {

  var _ = require('lodash');
  const TemplateUtil = require('../lib/templateUtil.js');
  const templateUtil = new TemplateUtil();

  Nunjucks.addFilter('determineType', ([name, pythonName, property]) => {
    return determineType(name, pythonName, property);
  })

  Nunjucks.addFilter('functionName', ([channelName, channel]) => {
    return getFunctionNameByChannel(channelName, channel);
  })

  Nunjucks.addFilter('getFirstPublisherMessenger', (asyncapi) => {
    return getFirstPublisherMessenger(asyncapi);
  })

  Nunjucks.addFilter('getMessengers', (asyncapi) => {
    return getMessengers(asyncapi);
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

  Nunjucks.addFilter('indent4', (numTabs) => {
    return indent(numTabs + 3);
  })

  Nunjucks.addFilter('identifierName', (str) => {
    return templateUtil.getIdentifierName(str);
  })

  Nunjucks.addFilter('log', (str) => {
    console.log(str);
    return str;
  })

  Nunjucks.addFilter('logFull', (obj) => {
    console.log(obj);
    if (obj) {
      console.log(dump(obj));
      console.log(getMethods(obj));
    }
    return obj;
  })

  Nunjucks.addFilter('lowerFirst', (str) => {
    return _.lowerFirst(str);
  })

  // This returns the class name of the payload.
  Nunjucks.addFilter('payloadClass', (operation) => {
    let ret = operation.message().payload().ext('x-parser-schema-id');
    return ret;
  })

  Nunjucks.addFilter('upperFirst', (str) => {
    return _.upperFirst(str);
  })

  function determineType(name, pythonName, property) {
    //console.log('deterineType: ' + name);

    // For message headers, type is a property.
    // For schema properties, type is a function.
    let type = property.type;

    if (typeof type == "function") {
      type = property.type();
    }

    // If a schema has a property that is a ref to another schema,
    // the type is undefined, and the title gives the title of the referenced schema.
    let ret = {};
    if (type === undefined) {
      if (property.enum()) {
        ret.type = _.upperFirst(pythonName);
        ret.generalType = 'enum';
        ret.enum = property.enum();
        //console.log("enum is " + dump(ret.enum))
      } else {
        // check to see if it's a ref to another schema.
        ret.type = property.ext('x-parser-schema-id');
        ret.generalType = 'object';

        if (!ret.typeName) {
          throw new Error("Can't determine the type of property " + name);
        }
      }
    } else if (type === 'array') {
      ret.generalType = 'array';
      let items = property.items();
      if (!items) {
        throw new Error("Array named " + name + " must have an 'items' property to indicate what type the array elements are.");
      }

      let itemsType = items.type();
      if (itemsType) {

        if (itemsType === 'object') {
          isArrayOfObjects = true;
          itemsType = _.upperFirst(pythonName);
        } else {
          itemsType = typeMap.get(itemsType);
        }
      }
      if (!itemsType) {
        itemsType = items.ext('x-parser-schema-id');

        if (!itemsType) {
          throw new Error("Array named " + name + ": can't determine the type of the items.");
        }
      }
      ret.type = itemsTypeName
      //ret = _.upperFirst(itemsType) + "[]";
    } else if (type === 'object') {
      ret.generalType = 'object';
      ret.type = _.upperFirst(pythonName);
    } else {
      ret.generalType = 'simple';
      ret.type = type;
    }
    return ret;

  }

  function dump(obj) {
    let s = typeof obj;
    for (let p in obj) {
      s += " ";
      s += p;
    }
    return s;
  }

  const getMethods = (obj) => {
    let properties = new Set()
    let currentObj = obj
    do {
      Object.getOwnPropertyNames(currentObj).map(item => properties.add(item))
    } while ((currentObj = Object.getPrototypeOf(currentObj)))
    return [...properties.keys()].filter(item => typeof obj[item] === 'function')
  }

  function getFunctionNameByChannel(channelName, channel) {
    let ret = _.camelCase(channelName);
    //console.log('functionName channel: ' + JSON.stringify(channelJson));
    let functionName = channel.ext(['x-function-name']);
    //console.log('function name for channel ' + channelName + ': ' + functionName);
    if (functionName) {
      ret = functionName;
    }
    return ret;
  }

  function getMessengers(asyncapi) {
    let haveMessenger = false;
    let ret = [];

    for (channelName in asyncapi.channels()) {
      let channel = asyncapi.channel(channelName);
      if (channel.hasSubscribe()) {
        let messenger = {};
        messenger.name = _.camelCase(channelName) + "Messenger";
        messenger.functionName = getFunctionNameByChannel(channelName, channel);
        messenger.topic = channelName;
        messenger.payload = channel.subscribe().message().payload();
        //console.log(messenger);
        ret.push(messenger);
      }
    }

    if (ret.length === 0) {
      let messenger = {};
      messenger.name = "messenger";
      ret.push(messenger);
    }

    return ret;
  }

  function getFirstPublisherMessenger(asyncapi) {
    for (channelName in asyncapi.channels()) {
      let channel = asyncapi.channel(channelName);
      if (channel.hasPublish()) {
        let messenger = {};
        messenger.name = _.camelCase(channelName) + "Messenger";
        messenger.functionName = getFunctionNameByChannel(channelName, channel);
        messenger.topic = channelName;
        messenger.payload = channel.subscribe().message().payload();
        return messenger;
      }
    }

    let messenger = {};
    messenger.name = "messenger";
    return messenger;
  }

  function indent(numTabs) {
    return " ".repeat(numTabs * 4);
  }
}