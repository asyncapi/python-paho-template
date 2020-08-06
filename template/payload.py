{% from "partials/model-class" import modelClass -%}
from enum import Enum
from typing import Sequence
from entity import Entity
{% set schema = asyncapi | getAnonymousSchema -%}
{% if schema %}
{% set imports = schema | getImports -%}
{{ imports }}
{{ modelClass('Payload', schema.properties(), schema.required(), 0 ) }}
{% endif %}
