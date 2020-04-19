import paho.mqtt.client as mqtt
import configparser
import logging
import json
import paho.mqtt.client as mqtt

class Messaging:

    def __init__(self, config, clientId, qos = 0, subscription = None):
        global on_connect
        self.config = config
        self.client = mqtt.Client(clientId)
        self.client.enable_logger()
        self.client.on_connect = on_connect
        self.client.on_disconnect = on_disconnect

        if (subscription):
            self.client.user_data_set(subscription[0])
            self.client.on_message = subscription[1]

        self.client.username_pw_set(config['username'], config['password'])
        port = int(config['port'])
        self.client.connect(config['host'], port)

    def publish(self, topic, payload):
        self.client.publish(topic, payload)

    def subscribe(self, topic):
        self.client.subscribe(topic)

    def loop_forever(self):
        self.client.loop_forever()

    def loop_start(self):
        self.client.loop_start()

def on_connect(client, userdata, flags, rc):
    print("userdata: " + userdata)
    if (userdata):
        client.subscribe(userdata)

def on_disconnect(client, userdata, rc, other):
    print("on_disconnect: " + userdata)


