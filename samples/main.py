#!/usr/bin/env python3
import configparser
import json
import paho.mqtt.client as mqtt
import messaging
from order import Order
import time

order_topic = "order"
address_topic = "address"

# Config has the connection properties.
def getConfig():
    configParser = configparser.ConfigParser()
    configParser.read("config.ini")
    config = configParser['DEFAULT']
    return config

# This callback gets called when we receive a message.
    # The callback for when a PUBLISH message is received from the server.
def on_order_message(client, userdata, msg):
    m = msg.payload.decode('utf-8')
    print("got a message on topic '" + msg.topic + "' : " + m)
    o = Order.from_json(m)
    print(o)

def on_address_message(client, userdata, msg):
    m = msg.payload.decode('utf-8')
    print("got a message on topic '" + msg.topic + "' : " + m)
    o = Order.Address.from_json(m)
    print(o)

def main():
    global order_topic, address_topic
    config = getConfig()
    orderMessenger = messaging.Messaging(config, on_order_message, order_topic)
    print("starting orderMessenger")
    orderMessenger.loop_start()

    addressMessenger = messaging.Messaging(config, on_address_message, address_topic)
    print("starting addressMessenger")
    addressMessenger.loop_start()

    # Create a person object, and then encode it as json and publish it.
    adr = Order.Address("12A", 'Main St.')
    ord = Order('shoes', 12.99, adr)
    ordStr = ord.to_json()
    adrStr = adr.to_json()

    while(True):
        orderMessenger.publish(order_topic, ordStr)
        time.sleep(1)
        addressMessenger.publish(address_topic, adrStr)
        time.sleep(1)

if __name__ == '__main__':
    main()

