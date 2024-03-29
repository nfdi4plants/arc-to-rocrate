# Process Type

## Schema.org hierarchy

This is a new Type that fits into the schema.org hierarchy as follows:
[Thing](http://schema.org/Thing) > [CreativeWork](http://schema.org/Creativework) > [Process](https://isa-specs.readthedocs.io/en/latest/isajson.html#process-schema-json)

## Description

A process represents the specific application of a protocol to some input material (a sample or a source) to produce some output (sample, source or data file).

## Properties

- [`Process`](https://isa-specs.readthedocs.io/en/latest/isajson.html#process-schema-json)
  - [`name`](): [`Text`](https://schema.org/Text)
  - [`creator`](http://schema.org/Creator): [`Person`](https://schema.org/Person) or [`Organization`](https://schema.org/Organization)
  - [`dateCreated`](http://schema.org/dateCreated): [`Date`](https://schema.org/Date)
  - [`inputs`](): [`Sample`](https://bioschemas.org/types/Sample/0.2-DRAFT-2018_11_09) or [`MediaObject`](https://schema.org/MediaObject)
  - [`outputs`](): [`Sample`](https://bioschemas.org/types/Sample/0.2-DRAFT-2018_11_09) or [`MediaObject`](https://schema.org/MediaObject)
  - [`parameterValues`](): [`PropertyValue`](https://schema.org/PropertyValue)
  - [`executesProtocol`](): [`Protocol`]()


