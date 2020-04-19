from entity import Entity

class Order(Entity):

    def __init__(
        self, 
        description, 
        price, address
        ):
        self.description = description
        self.price = price
        self.address = address

    class Address(Entity):
        
        def __init__(self, streetNo, street):
            self.streetNo = streetNo
            self.street = street

