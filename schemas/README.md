# Mapping the ISA Process Model to RO-Crate/schema.org/bioschemas

Abstract/simplified version of the core ISA Process Model with its mapping to schema.org/bioschemas types (green types and properties are new proposals, blue types and properties exist in bioschemas, red properties are optional):

```mermaid
flowchart TD

dataset[<h2>Study/Assay=Dataset</h3>- <font color=green>process_sequence=processSequence</font><br>- hasPart<br>- ...]

Process[<h2>Process=<font color=green>LabProcess</font></h2>- name<br>- performer=agent<br>- date=endTime<br>- inputs=object<br>- outputs=result<br>- <font color=green>parameter_values=parameterValues</font><br>- <font color=green>executes_protocol=executesProtocol</font>]

Protocol[<h2>Protocol=<font color=blue>LabProtocol</font></h2>- name<br>- <font color=blue>protocol_type=purpose</font><br>- <font color=blue>components=labEquipment/reagent/software</font><br>- <font color=red>protocol_parameters=?</font><br>- version<br>- comment<br>- description<br>- url]

BioSample[<h2>Source/Sample/Material=<font color=blue>Sample</font></h2>- name<br>- characteristics=additionalProperty<br>- factors=additionalProperty<br>- <font color=red>derivesFrom=?</font>]

DataFile[<h2>Data=MediaObject</h2>- name<br>- <font color=red>type=?</font><br>- comment]

ont[<h2>OntologyAnnotation=DefinedTerm</h2>- annotationValue=name<br>termSource=inDefinedTermSet<br>- termAccession=termCode]

prop[<h2>ParameterValue=PropertyValue</h2>- category=propertyID/name<br>- unit=unitCode/unitText<br>- value=valueReference/value]

dataset --hasPart--> dataset
dataset --hasPart----> DataFile
dataset --process_sequence--> Process

Process --"output"---> DataFile
Process --"output"--> BioSample
Process --input--> BioSample
Process --executesProtocol--> Protocol
Process --parameterValues---> prop

BioSample --derivesFrom--> BioSample
BioSample --additionalProperty--> prop

Protocol --protocolType---> ont
Protocol --parameters---> ont

prop --category--> ont
prop --value--> ont
prop --unit--> ont

```

When only considering the core "functionality" of ISA, seven types need to be mapped: `Study`/`Assay` (merged since they both represent a process sequence with additional metadata), `Process`, `Protocol`, `Source`/`Sample` (merged since a source is a sample without factors), `Data`, `OntologyAnnotation`, and `ParameterValue` (representing all forms of values, e.g. `FactorValue`, `MaterialAttributeValue`, etc.).

`Study`/`Assay` should be a `Dataset`, as required by RO-Crate.
`Data` should be a `MediaObject`/`File`, again as required by RO-Crate.

For `Material`, the type `BioSample` already exists in bioschemas.
An `OntologyAnnotation` can be mapped to `DefinedTerm` and a `ParameterValue` to `PropertyValue`.

Apart from the process sequence, only minor changes are necessary for these types (more details later).
Mapping the process sequence is the core problem, which we explain now.

## Main types missing

In terms of ISA, the LabProtocol type is an incomplete mixture of two things at once:
- `Protocol` (properties `protocolPurpose`, `protocolAdvantage`, `protocolOutcome`, etc.)
- `Process` (`sampleUsed`, `executionTime`).

It can also interpreted as a `ProcessSequence`, considering the `step` property.

For a `Process` the following concepts are missing:
- `output`/"sampleProduced"
- `parameters` and their values
- `inputs` and `outputs` might both either be physical entities (samples) or digital entities (data)
- maybe executed protocol

For a Protocol the following concepts are missing:
- `parameters`

Further minor problems when mapping these ISA types to a LabProtocol:
- `labEquipment`/`reagent`/`software` are `components` in ISA, but components are CV key-value pairs (in particular in the ARC), which would make `PropertyValue` more suitable than `DefinedTerm`
- `protocolType` does not exist in `LabProtocol`
- `nextProcess`/`previousProcess` do not exist in `LabProtocol`

## Parameter Values

`ParameterValues` in ISA are very generic key-value pairs. Thus, the `PropertyValue` type seems to fit well. 

However, in schema.org, only the key (`valueReference`) can be an ontology annotation (`DefinedTerm`). In ISA, the value and the unit can also be ontology terms. 

- E.g.: For a given key [organism](http://purl.obolibrary.org/obo/OBI_0100026), the value might be [Arabidopsis thaliana](https://ontobee.org/ontology/NCBITaxon?iri=http://purl.obolibrary.org/obo/NCBITaxon_3702).
- E.g.: For a given key [temperature](http://purl.obolibrary.org/obo/PATO_0000146), the value might have the unit [degree Celsius](http://purl.obolibrary.org/obo/UO_0000027).

In a `PropertyValue`, the value can only be `StructuredValue`, not `DefinedTerm`. The unit only has a code and a text, not an ontology reference.




Our desired schema for `PropertyValue` would look like this:
```JSON
{
    "valueReference" : {
        "anyOf" : [
            {"$ref": "DefinedTerm_schema.json#"},
            ...
        ]
    },
    "value": {
        "anyOf" : [
            { "$ref": "DefinedTerm_schema.json#"},
            { "type": "string"},
            { "type": "number"}
        ]
    },
    "unitReference": {
        "$ref": "DefinedTerm_schema.json#"
    }
}
```

## Type Definitions

According to the problems decribed above, we propose the following new or adapted types:

- [Process](/schemas/process_schema.md)
- [Protocol](/schemas/protocol_schema.md)
- [PropertyValue](/schemas/propertyvalue_schema.md)