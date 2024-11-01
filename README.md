# arc-to-rocrate

Repository for exporting the arc to a RO-Crate.

> [!IMPORTANT]  
> Outdated Repository: While the concept of conversion from ARC to RO-Crate is still correct, the provided scripts are based on outdated libraries and do no longer work.

### General workflow

The `ARC` has to be exported to json together with its [jsonld context](http://niem.github.io/json/reference/json-ld/context/) file. This can then be flattened into a concise and semantically correct `ro-crate`.

```mermaid
flowchart LR

arc["ARC"]
data["ARC Datamodel"]
json["ARC json"]
jsonld["ARC json-ld"]
roc["RO-Crate"]

arcContext["ARC Context"]
rocContext["RO-Crate Context"]

arc --read using ARCtrl--> data
data --export using ARCtrl--> json


data & arcContext --- D[ ]:::empty --export using ARCtrl--> jsonld


jsonld & rocContext --- E[ ]:::empty --json-ld tool--> roc

roc --import--> data

```

The `RO-Crate` (and therefore also the `ARC json-ld`) should be designed in a way to allow complete (without loss) import into the ARC datamodel. So the ARC json-ld should cover all logical connections that are important for the ARC.

This repository contains scripts and/or other functionality for converting the `ARC json-ld` to a proper `RO-Crate`. At the moment, two options are given:

- The F# script `export_and_flatten_arc.fsx` loads an example ARC (from the `ARCCtrl` tests), uses `ARCCtrl` to export the json representation of the ARC, and then converts it into an RO-Crate using the [`flatten`](https://www.w3.org/TR/json-ld11-api/#dfn-flattened) function of the [`json-ld.net`](https://www.nuget.org/packages/json-ld.net) library.
- This process can also be done using the [`json-ld`](https://www.w3.org/TR/json-ld11-api/) command line tools. The script `export_arc.fsx` loads an example ARC (from the `ARCCtrl` tests) and uses `ARCCtrl` to export the json representation of the ARC without flattening. The output can be saved into a file by running `dotnet fsi export_and_flatten_arc.fsx > <filename>`. The command `jsonld flatten -c "https://w3id.org/ro/crate/1.1/context" <filename>` then converts it into an RO-Crate using the [`flatten`](https://www.w3.org/TR/json-ld11-api/#dfn-flattened) function.

### Profiles

RO-Crate profiles could act as a kind of RO-Crate ARC specification and would give us visibility in the RO-Crate community. They are separated in a human readable and a machine readable component. 

- Investigation
  - [Description](/profiles/investigation.md)
  - [Json Schema](/profiles/investigation.json) (work in progress)
- Study
  - work in progress
- Assay
  - work in progress

### Additional Types Needed

When mapping the ISA model to schema.org and bioschemas in a naive fashion, we ran into some dead-ends. The [schemas subdirectory](/schemas/README.md) contains a detailed description of these problems together with suggestions for additional types that enable a proper mapping from ISA to schema.org.

### Validation

In order to validate if a given RO-Crate represents an ARC, we want to use JSON Schema. Since validation of flattened JOSN-LD is not straight-forward, we first have to bring the RO-Crate into a canonical form. For this, we use JSON-LD Framing together with Expanding. We first use Framing with full embedding to generate one JSON object describing the RO-Crate metadata entity. Through embedding, this object contains the investigation object and all other ISA metadata objects. We then use expanding to resolve all terms given in contexts into full schema.org URLs. A JSON Frame and according scripts will be added in the future.
