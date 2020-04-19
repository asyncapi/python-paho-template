import json
import sys

class Entity():

    @classmethod
    def from_json(cls, data):
        jsonObj = json.loads(data)
        print("From json:", cls, data)
        try:
            return cls(**jsonObj)
        except:
            print("Unexpected error:", sys.exc_info())
            raise

    def to_json(self):
        return json.dumps(self, default=lambda o: o.__dict__, sort_keys=True, indent=2)
