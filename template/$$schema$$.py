{% from "partials/model-class" import modelClass -%}
from enum import Enum
from typing import Sequence
from entity import Entity
{% set imports = schema | getImports %}
{{ imports }}
{{ modelClass(schemaName, schema.properties(), schema.required(), 0 ) }}
