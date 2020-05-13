from enum import Enum
import json
from sensorReading import SensorReading

class BaseUnitLa(Enum):
    FARENHEIT = 'FARENHEIT'
    CELCIUS = 'CELCIUS'

sr = SensorReading("foo", 1, SensorReading.BaseUnit.CELCIUS)
sr1 = SensorReading("foo", 1, None)

s = sr.to_json()
print(s)

js = '{"baseUnit": "CELCIUS","sensorId": "foo","temperature": 1}'
sr2 = SensorReading.from_json(js)
print(sr2.baseUnit)