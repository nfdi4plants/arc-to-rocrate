# ExperimentalProcess Type

## Schema.org hierarchy

This is a new Type that fits into the schema.org hierarchy as follows:
[Thing](http://schema.org/Thing) > [CreativeWork](http://schema.org/Creativework) > [ExperimentalProcess](https://isa-specs.readthedocs.io/en/latest/isajson.html#process-schema-json)

## Description

A process represents the application of a protocol to some input material (a sample or a source) to produce some output (sample, source or data file).

## Properties

- [`ExperimentalProcess`](https://isa-specs.readthedocs.io/en/latest/isajson.html#process-schema-json)
  - [`name`](): [`Text`](https://schema.org/Text)
  - [`creator`](http://schema.org/Creator): [`Person`](https://schema.org/Person) or [`Organization`](https://schema.org/Organization)
  - [`dateCreated`](http://schema.org/dateCreated): [`Date`](https://schema.org/Date)
  - [`inputs`](): [`BioSample`](https://bioschemas.org/types/BioSample/0.1-RELEASE-2019_06_19) or [`MediaObject`](https://schema.org/MediaObject)
  - [`outputs`](): [`BioSample`](https://bioschemas.org/types/BioSample/0.1-RELEASE-2019_06_19) or [`MediaObject`](https://schema.org/MediaObject)
  - [`parameterValues`](): [`PropertyValue`](https://schema.org/PropertyValue)
  - [`executesProtocol`](): [`Protocol`]()


