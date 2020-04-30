const filter = module.exports;
const _ = require('lodash');
const TemplateUtil = require('../lib/templateUtil.js');
const templateUtil = new TemplateUtil();

const typeMap = {
  "integer": "int",
  "number": "float",
  "string": "str"
}

function upperFirst(s) {
  return _.upperFirst(s);
}

filter.upperFirst = upperFirst;

function getTypeInfo([name, property]) {
  return determineType(name, property);
}
filter.getTypeInfo = getTypeInfo;


function functionName([channelName, channel]) {
  return getFunctionNameByChannel(channelName, channel);
}
filter.functionName = functionName;

// This returns an object containing information the template needs to render topic strings.
function topicInfo([channelName, channel]) {
  let p = channel.parameters();
  return getTopicInfo(channelName, channel);
}
filter.topicInfo = topicInfo;

function indent1(numTabs) {
  return indent(numTabs);
}
filter.indent1 = indent1;

function  indent2(numTabs) {
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

function logFull(obj) {
  console.log(obj);
  if (obj) {
    console.log(dump(obj));
    console.log(getMethods(obj));
  }
  return obj;
}
filter.logFull = logFull;


// This returns the class name of the payload.
function payloadClass(operation) {
  let ret = operation.message().payload().ext('x-parser-schema-id');
  return ret;
}
filter.payloadClass = payloadClass;

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
  ret.pythonName = templateUtil.getIdentifierName(name);
  //console.log(name + ": " + type);

  if (type === undefined) {
    if (property.enum()) {
      ret.type = _.upperFirst(ret.pythonName);
      ret.pythonType = ret.type;
      ret.generalType = 'enum';
      ret.enum = property.enum();
      //console.log("enum is " + dump(ret.enum))
    } else {
      // check to see if it's a ref to another schema.
      ret.type = property.ext('x-parser-schema-id');
      ret.generalType = 'object';
      ret.pythonType = ret.type

      if (!ret.type) {
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
    let pythonType = null

    if (itemsType) {

      if (itemsType === 'object') {
        isArrayOfObjects = true;
        itemsType = _.upperFirst(ret.pythonName);
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
    ret.type = itemsType
    pythonType = "Sequence[" + itemsType + "]"
    //ret = _.upperFirst(itemsType) + "[]";
  } else if (type === 'object') {
    ret.generalType = 'object';
    ret.type = _.upperFirst(ret.pythonName);
    ret.pythonType = ret.type
  } else {
    ret.generalType = 'simple';
    ret.pythonType = typeMap[type]
    ret.type = type;
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
      let topicInfo = getTopicInfo(channelName, channel);
      messenger.name = _.camelCase(channelName) + "Messenger";
      messenger.functionName = getFunctionNameByChannel(channelName, channel);
      messenger.topic = topicInfo.subscribeTopic;
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
filter.getMessengers = getMessengers;

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
    const parameter = channel.parameter(name);
    const schema = parameter.schema();
    const type = schema.type();
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
