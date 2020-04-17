import paho.mqtt.client as mqtt
import configparser
import json
import paho.mqtt.client as mqtt

class Messaging:

    def __init__(self, config, callback, subscription = None):
        global on_connect
        self.config = config
        self.client = mqtt.Client(config['clientId'])
        self.client.on_message = callback
        self.client.on_connect = on_connect

        if (subscription):
            print("subscription: " + subscription)
            self.client.user_data_set(subscription)
        
        self.client.username_pw_set(config['username'], config['password'])
        port = int(config['port'])
        self.client.connect_async(config['host'], port)

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


