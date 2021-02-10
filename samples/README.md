# How to run the sample 

## Prerequisites

- Python 3 with `pip` and `paho-mqtt` preinstalled
- Docker 

## Run the example

1. Generate the code
    ```
    ag  https://raw.githubusercontent.com/asyncapi/python-paho-template/master/samples/temperature.yaml @asyncapi/python-paho-template -o ./generated_code
    ```
2.  Patch main.py to send some data
    An example of code:

    ```
      # Example of how to publish a message. You will have to add arguments to the constructor on the next line:
      payload = SensorReading("SensorId3",12,SensorReading.BaseUnit.CELSIUS)
    ```
3. Create Mosquitto broker configuration

    Get the example configuration from [here](https://github.com/asyncapi/python-paho-template/blob/master/samples/mosquitto.conf)
  
    > In `mosquitto.conf` we enabled anonymous logging. This **SHOULD NOT** be the case in production.
  
4. Install and run mosquitto MQTT broker
    ```
    docker run -it -p 0.0.0.0:1883:1883 -p 0.0.0.0:9001:9001 -v $PWD/../samples/mosquitto.conf:/mosquitto/config/mosquitto.conf  eclipse-mosquitto
    ```
5. Configure .ini file
    Rename `config-template.inì` into `config.ini` and paste:
    ```
    [DEFAULT]
    host=127.0.0.1
    password=
    port=1883
    username=
     ```
6. Run your code
    ```
    python main.py
    ```
