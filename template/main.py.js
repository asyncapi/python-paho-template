const { File } = require('@asyncapi/generator-react-sdk');
const _ = require('lodash');
const { getRealSubscriber } = require('../helpers/all.js')
const { functionName } = require('../helpers/all.js')
const { payloadClass }= require('../helpers/all.js')
const {getFirstPublisherMessenger } = require('../helpers/all.js')
const {getMessengers } = require('../helpers/all.js')

function generatePythonCode(asyncapi, params) {
  let code = `#!/usr/bin/env python3
import configparser
import logging
import time
import messaging
`;

  Object.entries(asyncapi.components().schemas()).map(([schemaName, schema]) => {
    const moduleName = _.lowerFirst(schemaName);
    code += `from ${moduleName} import ${_.upperFirst(schemaName)}\n`;
  });

  code += `
# Config has the connection properties.
def getConfig():
    configParser = configparser.ConfigParser()
    configParser.read('config.ini')
    config = configParser['DEFAULT']
    return config
`;

  const channels = asyncapi.channels();

  Object.entries(channels).map(([channelName, channel]) => {
    const sub = getRealSubscriber([asyncapi.info(), params, channel]);
    if (sub) {
      const fnName = functionName([channelName, channel]);
      const payloadClasses = payloadClass(sub);
      const varName = _.lowerFirst(payloadClasses);
      code += `def ${fnName}(client, userdata, msg):
    jsonString = msg.payload.decode('utf-8')
    logging.info('Received json: ' + jsonString)
    ${_.lowerFirst(payloadClasses)} = ${payloadClasses}.from_json(jsonString)
    logging.info('Received message: ' + str(${_.lowerFirst(payloadClasses)}))
`;
    }
  })

  code += `
def main():
    logging.basicConfig(level=logging.INFO)
    logging.info('Start of main.')
    config = getConfig()
`;

  const publishMessenger = getFirstPublisherMessenger([params, asyncapi]);
  const messengers = getMessengers([params, asyncapi]);

  messengers.forEach(messenger => {
    if (messenger.subscribeTopic) {
      code += `    ${messenger.name} = messaging.Messaging(config, '${messenger.subscribeTopic}', ${messenger.functionName})\n`;
    } else {
      code += `    ${messenger.name} = messaging.Messaging(config)\n`;
    }
    
    if (publishMessenger) {
      code += `    ${messenger.name}.loop_start()\n`;
    } else {
      code += `    ${messenger.name}.loop_forever()\n`;
    }
  });

  if (publishMessenger) {
    code += `
    # Example of how to publish a message. You will have to add arguments to the constructor on the next line:
    payload = ${publishMessenger.payloadClass}()
    payloadJson = payload.to_json()
    while True:
        ${publishMessenger.name}.publish('${publishMessenger.publishTopic}', payloadJson)
        time.sleep(1)
`;
  }

  code += `if __name__ == '__main__':
  main()`

  return code;
}

function MainFile({ asyncapi, params }) {
  const generatedCode = generatePythonCode(asyncapi, params);
  
  return (
    <File name="main.py">
      {generatedCode}
    </File>
  );
}

module.exports = MainFile