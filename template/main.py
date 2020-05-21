#!/usr/bin/env python3
import configparser
import logging
import time

import messaging

{% for schemaName, schema in asyncapi.components().schemas() -%}
{% set moduleName = schemaName | lowerFirst -%}
from {{ moduleName }} import {{ schemaName }}
{% endfor %}


# Config has the connection properties.
def getConfig():
    configParser = configparser.ConfigParser()
    configParser.read('config.ini')
    config = configParser['DEFAULT']
    return config

{% for channelName, channel in asyncapi.channels() -%}
{% set sub = [asyncapi.info(), params, channel] | getRealSubscriber -%}
{%- if sub -%}
{%- set functionName = [channelName, channel] | functionName -%}
{%- set payloadClass = sub | payloadClass -%}
{%- set varName =  payloadClass | lowerFirst %}
def {{ functionName }}(client, userdata, msg):
    jsonString = msg.payload.decode('utf-8')
    logging.info('Received json: ' + jsonString)
    {{ varName }} = {{ payloadClass }}.from_json(jsonString)
    logging.info('Received message: ' + str({{ varName }}))
{% endif %}
{% endfor %}

def main():
    logging.basicConfig(level=logging.INFO)
    logging.info('Start of main.')
    config = getConfig()
{% set messengers = [params, asyncapi] | getMessengers -%}
{%- for messenger in messengers -%}
{%- if messenger.subscribeTopic %}
    {{ messenger.name }} = messaging.Messaging(config, '{{ messenger.topic }}', {{ messenger.functionName }})
{%- else %}
    {{ messenger.name }} = messaging.Messaging(config)
{%- endif %}
    {{ messenger.name }}.loop_start()
{%- endfor %}
{% set messenger = [params, asyncapi] | getFirstPublisherMessenger -%}
{%- if messenger %}
    # Example of how to publish a message:
    payload = {{ messenger.payloadClass }}()
    payloadJson = payload.to_json()

    while (True):
        {{ messenger.name }}.publish('{{ messenger.publishTopic }}', payloadJson)
        time.sleep(1)
{%- endif %}

if __name__ == '__main__':
    main()

