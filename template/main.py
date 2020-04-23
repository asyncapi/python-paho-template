#!/usr/bin/env python3
import configparser
import logging

import messaging

{# for component in asyncapi.components().s -#}
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
{%- if channel.hasSubscribe() -%}
{%- set functionName = [channelName, channel] | functionName -%}
{%- set payloadClass = channel.subscribe() | payloadClass -%}
{%- set varName =  payloadClass | lowerFirst %}
def {{ functionName }}(client, userdata, msg):
    jsonString = m = msg.payload.decode('utf-8')
    logging.debug('Received json: ' + jsonString)
    {{ varName }} = {{ payloadClass }}.from_json(jsonString)
    logging.info('Received message: ' + {{ varName }})
{% endif %}
{% endfor %}

def main():
    logging.basicConfig(level=logging.INFO)
    logging.info('Start of main.')
    config = getConfig()
{% set messengers = asyncapi | getMessengers -%}
{%- for messenger in messengers -%}
{%- if messenger.topic %}
    {{ messenger.name }} = messaging.Messaging(config, '{{ messenger.topic }}', {{ messenger.functionName }})
{%- else %}
    {{ messenger.name }} = messaging.Messaging(config)
{%- endif %}
    {{ messenger.name }}.loop_start()
{%- endfor %}


# TODO: Add your business logic here.
{% set messenger = asyncapi | getFirstPublisherMessenger -%}
{%- if messenger -%}
# To send a message, do this:
# payload = YourPayloadClass(yourArgs)
# jsonString = payload.to_json()
# {{ messenger.name }}.publish("yourTopic", jsonString)
{%- endif %}

if __name__ == '__main__':
    main()

