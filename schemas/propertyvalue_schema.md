# ISA-ParameterValue Type

## Schema.org hierarchy

This is a new Type that fits into the schema.org hierarchy as follows:
[Thing](http://schema.org/Thing) > [Intangible](http://schema.org/Intangible) > [StructuredValue]() > [PropertyValue]()

## Description

ToDo

## Properties

ToDo:
- [`Process`](https://isa-specs.readthedocs.io/en/latest/isajson.html#process-schema-json)
  - [`name`](): [`Text`](https://schema.org/Text)
  - [`creator`](http://schema.org/Creator): [`Person`](https://schema.org/Person) or [`Organization`](https://schema.org/Organization)
  - [`dateCreated`](): [`Date`](https://schema.org/Date)
  - [`inputs`](): [`BioSample`](https://bioschemas.org/types/BioSample/0.1-RELEASE-2019_06_19)
  - [`outputs`](): [`BioSample`](https://bioschemas.org/types/BioSample/0.1-RELEASE-2019_06_19)
  - [`parameterValues`](): [`PropertyValue`](https://schema.org/PropertyValue)
  - [`executesProtocol`](): [`Protocol`]()


