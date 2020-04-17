import json

class Entity():

    @classmethod
    def from_json(cls, data):
        return cls(**data)

    def to_json(self):
        return json.dumps(self, default=lambda o: o.__dict__, sort_keys=True, indent=2)
