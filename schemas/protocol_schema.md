# Protocol Type

## Schema.org hierarchy

This is a new Type that fits into the schema.org hierarchy as follows:
[Thing](http://schema.org/Thing) > [CreativeWork](http://schema.org/CreativeWork) > [Protocol](https://isa-specs.readthedocs.io/en/latest/isajson.html#protocol-schema-json)

## Description

A protocol represents the abstraction of a scientific workflow. It describes and parametrizes the atomic steps needed to perform this workflow.

## Properties

ToDo:
- [`Protocol`](https://isa-specs.readthedocs.io/en/latest/isajson.html#process-schema-json)
  - [`name`](): [`Text`](https://schema.org/Text)
  - [`protocolType`](): [`DefinedTerm`](https://schema.org/DefinedTerm)
  - [`description`](https://schema.org/description): [`Text`](https://schema.org/Text)
  - [`component`](): [`DefinedTerm`](https://schema.org/DefinedTerm) or [`Text`](https://schema.org/Text)
  - [`parameter`](): [`DefinedTerm`](https://schema.org/DefinedTerm)


