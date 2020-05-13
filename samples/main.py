#!/usr/bin/env python3
import configparser
import json
import logging
import time

import paho.mqtt.client as mqtt
import messaging
from order import Order

order_topic = "order"
address_topic = "address"

# Config has the connection properties.
def getConfig():
    configParser = configparser.ConfigParser()
    configParser.read("config.ini")
    config = configParser['DEFAULT']
    return config

# This callback gets called when we receive a message.
def on_order_message(client, userdata, msg):
    m = msg.payload.decode('utf-8')
    logging.info("got a message on topic '" + msg.topic + "' : " + m)
    o = Order.from_json(m)
    logging.info(o)

def on_address_message(client, userdata, msg):
    m = msg.payload.decode('utf-8')
    logging.info("got a message on topic '" + msg.topic + "' : " + m)
    o = Order.Address.from_json(m)
    logging.info(o)

def main():
    global order_topic, address_topic
    logging.basicConfig(level=logging.DEBUG)
    logging.info("Start of main.")
    config = getConfig()
    #orderMessenger = messaging.Messaging(config, "orderClient", on_order_message, order_topic)
    orderMessenger = messaging.Messaging(config, "orderClient")
    print("starting orderMessenger")
    orderMessenger.loop_start()

    addressMessenger = messaging.Messaging(config, "addressClient", address_topic, on_address_message)
    print("starting addressMessenger")
    addressMessenger.loop_start()

    # Create an address object and an order object. Encode them as json and publish them.
    adr = Order.Address("12A", 'Main St.')
    ord = Order('shoes', 12.99, adr)
    ordStr = ord.to_json()
    adrStr = adr.to_json()

    while(True):
        orderMessenger.publish(order_topic, ordStr, 2)
        time.sleep(1)
        addressMessenger.publish(address_topic, adrStr, 2)
        time.sleep(1)

if __name__ == '__main__':
    main()

