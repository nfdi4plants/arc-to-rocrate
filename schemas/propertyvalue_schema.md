# ISA-ParameterValue Type

## Schema.org hierarchy

This is a new Type that fits into the schema.org hierarchy as follows:
[Thing](http://schema.org/Thing) > [Intangible](http://schema.org/Intangible) > [StructuredValue](http://schema.org/StructuredValue) > [ParameterValue]()

## Description

A parameter value describes the value of a protocol parameter given an executed instance (ExperimentalProcess) of the protocol. In contrast to a [PropertyValue](http://schema.org/PropertyValue), not only the [valueReference](http://schema.org/valueReference)/category can be a ontology term ([DefinedTerm](http://schema.org/DefinedTerm)), but also the actual [value](http://schema.org/value) and unit.

## Properties

ToDo:
- [`ParameterValue`](https://isa-specs.readthedocs.io/en/latest/isajson.html#process-schema-json)
  - [`category`](): [`DefinedTerm`](https://schema.org/DefinedTerm)
  - [`value`](): [`DefinedTerm`](https://schema.org/DefinedTerm) or [`Text`](https://schema.org/Text)
  - [`unit`](): [`DefinedTerm`](https://schema.org/DefinedTerm)
