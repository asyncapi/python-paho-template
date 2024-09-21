const { File } = require('@asyncapi/generator-react-sdk');
const _ = require('lodash');
const { getRealSubscriber } = require('../helpers/all.js')
const {getFunctionNameByChannel } = require('../helpers/all.js')
const {getPayloadClass }= require('../helpers/all.js')
const {getFirstPublisherMessenger } = require('../helpers/all.js')
const {getMessengers } = require('../helpers/all.js')

function generatePythonCode(asyncapi, params) {
  let code = `#!/usr/bin/env python3
import configparser
import logging
import time
import messaging
`;

  if (asyncapi.components() && asyncapi.components().schemas()) {
    Object.entries(asyncapi.components().schemas()).forEach(([schemaName, schema]) => {
      const moduleName = _.lowerFirst(schemaName);
      code += `from ${moduleName} import ${_.upperFirst(schemaName)}\n`;
    });
  } else {
    code += 'from payload import Payload\n';
  }

  code += `
# Config has the connection properties.
def getConfig():
    configParser = configparser.ConfigParser()
    configParser.read('config.ini')
    config = configParser['DEFAULT']
    return config
`;

  

  code += `
def main():
    logging.basicConfig(level=logging.INFO)
    logging.info('Start of main.')
    config = getConfig()
`;

  // const publishMessenger = getFirstPublisherMessenger(params, asyncapi);
  // const messengers = getMessengers(params, asyncapi);

  // messengers.forEach(messenger => {
  //   if (messenger.subscribeTopic) {
  //     code += `    ${messenger.name} = messaging.Messaging(config, '${messenger.subscribeTopic}', ${messenger.functionName})\n`;
  //   } else {
  //     code += `    ${messenger.name} = messaging.Messaging(config)\n`;
  //   }
    
  //   if (publishMessenger) {
  //     code += `    ${messenger.name}.loop_start()\n`;
  //   } else {
  //     code += `    ${messenger.name}.loop_forever()\n`;
  //   }
  // });

//   if (publishMessenger) {
//     code += `
//     # Example of how to publish a message. You will have to add arguments to the constructor on the next line:
//     payload = ${publishMessenger.payloadClass}()
//     payloadJson = payload.to_json()
//     while True:
//         ${publishMessenger.name}.publish('${publishMessenger.publishTopic}', payloadJson)
//         time.sleep(1)
// `;
//   }

  return code;
}

function MainFile({ asyncapi, params }) {
  const generatedCode = generatePythonCode(asyncapi, params);
  // const allChannels = channels.all()
  console.log("HIIII",asyncapi.channels())
  console.log("typeof",typeof asyncapi.channels())

  
  return (
    <File name="main.py">
      {generatedCode}
      {/* {`heello from msin`} */}
    </File>
  );
}

module.exports = MainFile