{% from "partials/model-class" import modelClass -%}
from entity import Entity
{{ modelClass(schemaName, schema, schema.properties(), schema.required(), 0 ) }}