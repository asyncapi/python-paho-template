const filter = module.exports;
const _ = require('lodash');
const TemplateUtil = require('../lib/templateUtil.js');
const templateUtil = new TemplateUtil();

const typeMap = {
  "integer": "int",
  "number": "float",
  "string": "str"
}

function getTypeInfo([name, property]) {
  return determineType(name, property);
}
filter.getTypeInfo = getTypeInfo;


function functionName([channelName, channel]) {
  return getFunctionNameByChannel(channelName, channel);
}
filter.functionName = functionName;

function getAnonymousSchema(asyncapi) {
  return anonymousSchema(asyncapi);
}
filter.getAnonymousSchema = getAnonymousSchema;

function getRealSubscriber([info, params, channel]) {
  return templateUtil.getRealSubscriber(info, params, channel);
}
filter.getRealSubscriber = getRealSubscriber;

function indent1(numTabs) {
  return indent(numTabs);
}
filter.indent1 = indent1;

function indent2(numTabs) {
  return indent(numTabs + 1);
}
filter.indent2 = indent2;

function indent3(numTabs) {
  return indent(numTabs + 2);
}
filter.indent3 = indent3;

function indent4(numTabs) {
  return indent(numTabs + 3);
}
filter.indent4 = indent4;

function identifierName(str) {
  return templateUtil.getIdentifierName(str);
}
filter.identifierName = identifierName;

// For files like the streetlights tutorial that don't have schemas, this finds the first anonymous schema in a message payload.
function anonymousSchema(asyncapi) {
  let ret = null;
  for (const channelName in asyncapi.channels()) {
    let channel = asyncapi.channel(channelName);
    let sub = channel.subscribe();
    //console.log("anonymousSchema " + channelName);
    //console.log("Sub:");
    //console.log(sub);

    if (sub) {
      ret = anonymouseSchemaFromOperation(sub);
    }

    if (!ret) {
      let pub = channel.publish();
      //console.log("Pub:");
      //console.log(pub)
      if (pub) {
        ret = anonymouseSchemaFromOperation(pub);
      }
    }

    if (ret) {
      return ret;
    }
  }
}

function anonymouseSchemaFromOperation(operation) {
  let ret = null;
  let payloadClassName = filter.payloadClass(operation);
  //console.log('anonymouseSchemaFromOperation ' + payloadClass);
  if (payloadClassName === 'Payload') {
    ret = operation.message().payload();
  }
  return ret;
}

function logFull(obj) {
  console.log(obj);
  if (obj) {
    console.log(dump(obj));
    console.log(getMethods(obj));
  }
  return obj;
}
filter.logFull = logFull;


// This returns the class name of the payload. If the schema is embedded, rather than a reference
// to something in components/schemas, we return the name 'Payload' which will be the class we use for the payload.
function payloadClass(operation) {
  //console.log("payloadClass............");
  let ret = operation.message().payload().ext('x-parser-schema-id');
  //console.log(ret);
  if (ret.includes("anonymous-schema")) {
    ret = "Payload";
  }
  return _.upperFirst(ret);
}
filter.payloadClass = payloadClass;

// This returns the first server it can find in the servers section, mainly to 
// support the streetlights tutorial.
function server(asyncapi) {
  return templateUtil.getServer(asyncapi)
}
filter.server = server;


// This returns an object containing information the template needs to render topic strings.
function topicInfo([channelName, channel]) {
  return getTopicInfo(channelName, channel);
}
filter.topicInfo = topicInfo;

function determineType(name, property) {
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
  ret.properties = property.properties(); // can change if it's an embedded type.
  ret.pythonName = templateUtil.getIdentifierName(name);
  //console.log(name + ": " + type);
  //console.log(property);

  if (property.enum()) {
    ret.type = _.upperFirst(ret.pythonName);
    ret.pythonType = ret.type;
    ret.generalType = 'enum';
    ret.enum = property.enum();
    let e = ret.enum;


    for (var i = 0; i < e.length; i++) {
      let v = e[i].replace(/\W/g, '')
      e[i] = v;
      //console.log(v);
    }
    //console.log("enum is " + t);
  } else if (type === undefined) {
    // check to see if it's a ref to another schema.
    ret.type = property.ext('x-parser-schema-id');
    ret.generalType = 'objectRef';
    ret.pythonType = ret.type

    if (!ret.type) {
      throw new Error("Can't determine the type of property " + name);
    }
  } else if (type === 'array') {
    ret.generalType = 'array';
    let items = property.items();
    if (!items) {
      throw new Error("Array named " + name + " must have an 'items' property to indicate what type the array elements are.");
    }
    //console.log(items);
    let itemsType = items.type();

    if (itemsType) {
      if (itemsType === 'object') {
        ret.recursive = true;
        itemsType = _.upperFirst(ret.pythonName);
        ret.properties = items.properties();
      } else {
        itemsType = typeMap[itemsType];
      }
    }

    if (!itemsType) {
      itemsType = items.ext('x-parser-schema-id');
      ret.referenceType = itemsType;
      ret.importName = _.lowerFirst(itemsType);

      if (!itemsType) {
        throw new Error("Array named " + name + ": can't determine the type of the items.");
      }
    }
    //console.log(`Array type ${name} ${itemsType}`);
    ret.type = itemsType
    ret.innerType = itemsType
    ret.pythonType = "Sequence[" + itemsType + "]"
    //ret = _.upperFirst(itemsType) + "[]";
  } else if (type === 'object') {
    ret.recursive = true;
    ret.generalType = 'object';
    ret.type = _.upperFirst(ret.pythonName);
    ret.pythonType = ret.type
    ret.innerType = ret.type
  } else {
    ret.generalType = 'simple';
    ret.pythonType = typeMap[type]
    ret.type = type;
    ret.innerType = ret.type
  }

  //console.log("determineType:")
  //console.log(ret)
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

function getImports(schema) {
  let ret = '';
  //console.log("getImports");
  //console.log(getMethods(schema))
  //console.log(schema);
  var properties = schema.properties();


  if (schema.type() === 'array') {
    properties = schema.items().properties();
  }


  for (let propName in properties) {
    let property = properties[propName];
    //console.log(getMethods(property))
    let type = property.type();

    //console.log(`prop ${propName} - ${type}`);
    //console.log(property);
    if (type) {
      if (type === 'array') {
        let itemsType = property.items();
        let ref = itemsType.ext('x-parser-schema-id');
        if (ref && !ref.includes('anonymous')) {
          let importName = _.lowerFirst(ref);
          ret += `from ${importName} import ${ref}\n`
        }
      } else if (type === 'object') {
        ret += getImports(property);
      }
    } else {
      let ref = property.ext('x-parser-schema-id');
      //console.log(`undefined type, ref is ${ref}`);
      if (ref && !ref.includes('anonymous')) {
        let importName = _.lowerFirst(ref);
        ret += `from ${importName} import ${ref}\n`
      }
    }
  }
  //console.log(`getImports returing ${ret}`);
  return ret;
}
filter.getImports = getImports;

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
  let channelFunctionName = channel.ext('x-function-name');
  //console.log('function name for channel ' + channelName + ': ' + functionName);
  if (channelFunctionName) {
    ret = channelFunctionName;
  }
  return ret;
}

function getMessengers([params, asyncapi]) {
  let ret = [];

  for (const channelName in asyncapi.channels()) {
    let channel = asyncapi.channel(channelName);
    let sub = templateUtil.getRealSubscriber(asyncapi.info(), params, channel);

    if (sub) {
      let messenger = {};
      let subTopicInfo = getTopicInfo(channelName, channel);
      messenger.name = _.camelCase(channelName) + "Messenger";
      messenger.functionName = getFunctionNameByChannel(channelName, channel);
      messenger.subscribeTopic = subTopicInfo.subscribeTopic;
      messenger.payload = sub.message().payload();
      //console.log("payload:");
      //console.log(messenger.payload);
      messenger.payloadClass = filter.payloadClass(sub);
      //console.log(messenger.payloadClass);
      //console.log(messenger);
      ret.push(messenger);
    }
  }

  if (ret.length === 0) {
    let messenger = getFirstPublisherMessenger([params, asyncapi]);
    ret.push(messenger);
  }

  return ret;
}
filter.getMessengers = getMessengers;

function getFirstPublisherMessenger([params, asyncapi]) {
  //console.log('getFirstPublisherMessenger');
  let ret = null;
  for (const channelName in asyncapi.channels()) {
    let channel = asyncapi.channel(channelName);
    let pub = templateUtil.getRealPublisher(asyncapi.info(), params, channel);

    if (pub) {
      let messenger = {};
      messenger.name = _.camelCase(channelName) + "Messenger";
      messenger.functionName = getFunctionNameByChannel(channelName, channel);
      messenger.publishTopic = channelName;
      messenger.payload = pub.message().payload();
      messenger.payloadClass = filter.payloadClass(pub);
      //console.log("getFirstPublisherMessenger messenger.payloadClass: " + messenger.payloadClass);
      //console.log("getFirstPublisherMessenger messenger.name:         " + messenger.name);
      ret = messenger;
      break;
    }
  }
  //console.log('getFirstPublisherMessenger ' + ret);
  return ret;
}
filter.getFirstPublisherMessenger = getFirstPublisherMessenger;

// This returns an object containing information the template needs to render topic strings.
function getTopicInfo(channelName, channel) {
  const ret = {};
  let publishTopic = String(channelName);
  let subscribeTopic = String(channelName);
  const params = [];
  let functionParamList = "";
  let functionArgList = "";
  let sampleArgList = "";
  let first = true;

  //console.log("params: " + JSON.stringify(channel.parameters()));
  for (let name in channel.parameters()) {
    const nameWithBrackets = "{" + name + "}";
    //const parameter = channel.parameter(name);
    //const schema = parameter.schema();
    //const type = schema.type();
    const param = { "name": _.lowerFirst(name) };
    //console.log("name: " + name + " type: " + type);
    let sampleArg = 1;

    if (first) {
      first = false;
    } else {
      functionParamList += ", ";
      functionArgList += ", ";
    }

    sampleArgList += ", ";

    /* TODO rewrite this for Python.
  if (type) {
    //console.log("It's a type: " + type);
    const javaType = typeMap.get(type);
    if (!javaType) throw new Error("topicInfo filter: type not found in typeMap: " + type);
    param.type = javaType;
    const printfArg = formatMap.get(type);
    //console.log("printf: " + printfArg);
    if (!printfArg) throw new Error("topicInfo filter: type not found in formatMap: " + type);
    //console.log("Replacing " + nameWithBrackets);
    publishTopic = publishTopic.replace(nameWithBrackets, printfArg);
    sampleArg = sampleMap.get(type);
  } else {
    const en = schema.enum();
    if (en) {
      //console.log("It's an enum: " + en);
      param.type = _.upperFirst(name);
      param.enum = en;
      sampleArg = "Messaging." + param.type + "." + en[0];
      //console.log("Replacing " + nameWithBrackets);
      publishTopic = publishTopic.replace(nameWithBrackets, "%s");
    } else {
      throw new Error("topicInfo filter: Unknown parameter type: " + JSON.stringify(schema));
    }
  }
    */

    subscribeTopic = subscribeTopic.replace(nameWithBrackets, "*");
    functionParamList += param.type + " " + param.name;
    functionArgList += param.name;
    sampleArgList += sampleArg;
    params.push(param);
  }
  ret.functionArgList = functionArgList;
  ret.functionParamList = functionParamList;
  ret.sampleArgList = sampleArgList;
  ret.channelName = channelName;
  ret.params = params;
  ret.publishTopic = publishTopic;
  ret.subscribeTopic = subscribeTopic;
  ret.hasParams = params.length > 0;
  return ret;
}


function indent(numTabs) {
  return " ".repeat(numTabs * 4);
}
