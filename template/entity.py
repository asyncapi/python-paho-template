import json

class Entity():

    @classmethod
    def from_json(cls, data):
        jsonObj = json.loads(data)
        return cls(**jsonObj)

    def to_json(self):
        return json.dumps(self, default=lambda o: o.__dict__, sort_keys=True, indent=2)
