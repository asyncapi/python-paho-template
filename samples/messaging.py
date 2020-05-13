import paho.mqtt.client as mqtt
import configparser
import logging
import json
import paho.mqtt.client as mqtt

class Messaging:

    def __init__(self, config, subscription = None, on_message = None, clientId = None):
        global on_connect
        self.config = config

        if (clientId):
            self.client = mqtt.Client()
        else:
            self.client = mqtt.Client(clientId)

        self.client.enable_logger()
        self.client.on_connect = on_connect

        if (subscription):
            self.client.user_data_set(subscription)

        if (on_message):
            self.client.on_message = on_message

        self.client.username_pw_set(config['username'], config['password'])
        port = int(config['port'])
        self.client.connect(config['host'], port)

    def publish(self, topic, payload, qos = 0, retain = False):
        self.client.publish(topic, payload, qos, retain)

    def subscribe(self, topic):
        self.client.subscribe(topic)

    def loop_forever(self):
        self.client.loop_forever()

    def loop_start(self):
        self.client.loop_start()

def on_connect(client, userdata, flags, rc):
    if (userdata):
        client.subscribe(userdata, 2)

