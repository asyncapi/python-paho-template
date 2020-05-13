from entity import Entity
from enum import Enum

class SensorReading(Entity):

    def __init__(
            self,
            sensorId,
            temperature,
            baseUnit):
        self.sensorId = sensorId
        self.temperature = temperature
        self.baseUnit = baseUnit

    class BaseUnit(str, Enum):
        FARENHEIT = 'FARENHEIT'
        CELCIUS = 'CELCIUS'