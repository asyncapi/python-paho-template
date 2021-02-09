# How to run the sample 

## prerequisites

- python 
- docker 

## executing the sample

1. Generate the proxies
  ```
  ag  ./temperature.yaml @asyncapi/python-paho-template -o ./generated_code 
  ````
2.  patch main.py to send some data

just an example of code

```
    # Example of how to publish a message. You will have to add arguments to the constructor on the next line:
    payload = SensorReading("SensorId3",12,SensorReading.BaseUnit.CELSIUS)
```
3. Install and run mosquitto MQTT broker

in `mosquitto.conf` we enabled anonymous logging. this **SHOULD NOT** be the case in production.

```
docker pull eclipse-mosquitto
docker run -it -p 0.0.0.0:1883:1883 -p 0.0.0.0:9001:9001 -v <>.../samples/mosquitto.conf:/mosquitto/config/mosquitto.conf  eclipse-mosquitto
```
5. Configure .ini file

rename `config-template.inì` into `config.ini` and paste 

```
[DEFAULT]
host=127.0.0.1
password=
port=1883
username=
```

4. run your code

```
python main.py
```
