# python-paho-template
This is the Python Paho template for the AsyncAPI generator.

It is basically working but may not generate perfect code for every AsyncAPI document. It works correctly with the temperature.yml file included in the samples directory, which demonstrates a subscriber, a publisher, and a payload class with an embedded enum type.

Support for arrays, specifying function names and other features are yet to be implemented.

## About the samples directory

In the samples directory there is an example of code that is close to what we intend to generate.

## Configuration

To run the sample code, copy config-template.ini to config.ini and enter the connection details.

If no authentication is needed, you need not provide the username and password values.

If no host is given, the template attempts to find an mqtt host in the servers section of the AsyncAPI document to use instead.

## Specification Conformance
Note that this template interprets the AsyncAPI document in conformance with the [AsyncAPI Specification](https://www.asyncapi.com/docs/specifications/2.0.0/).
This means that when the template sees a subscribe operation, it will generate code to publish to that operation's channel.
It is possible to override this, see the 'view' parameter in the parameters section below.

## How to Use This Template

Install the AsyncAPI Generator
```
npm install -g @asyncapi/generator
```

Run the Generator using the Python Paho Template
```
ag ~/AsyncApiDocument.yaml @asyncapi/python-paho-template
```

Copy config-template.ini to config.ini and edit it to provide the connection details.

### Parameters

Parameters can be passed to the generator using command line arguments in the form ```-p param=value -p param2=value2```. Here is a list of the parameters that can be used with this template. In some cases these can be put into the AsyncAPI documents using the specification extensions feature. In those cases, the 'info' prefix means that it belongs in the info section of the document.

Parameter | Extension | Default | Description
----------|-----------|---------|---
view | info.x-view | client | By default, this template generates publisher code for subscribe operations and vice versa. You can switch this by setting this parameter to 'provider'.

## Specification Extensions

The following specification extensions are supported. In some cases their value can be provided as a command line parameter. The 'info' prefix means that it belongs in the info section of the document.

Extension | Parameter | Default | Description
----------|-----------|---------|-------------
info.x-view | view | client | By default, this template generates publisher code for subscribe operations and vice versa. You can switch this by setting this parameter to 'provider'.

