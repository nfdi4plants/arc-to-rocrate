# arc-to-rocrate

Repository for exporting the arc to a RO-Crate.

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

This repository contains scripts and/or other functionality for converting the `ARC json-ld` to a proper `RO-Crate`.
