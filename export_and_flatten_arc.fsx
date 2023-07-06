#r "nuget: Thoth.Json, 10.1.0"
#r "nuget: Thoth.Json.Net, 11.0.0"
#r "nuget: json-ld.net, 1.0.7"
#r "../ISADotNet_public/src/ISADotNet.Json/bin/Release/netstandard2.0/ISADotNet.dll"
#r "../ISADotNet_public/src/ISADotNet.Json/bin/Release/netstandard2.0/ISADotNet.Json.dll"
#r "../ISADotNet_public/tests/ISADotNet.Json.Tests/bin/Release/net6.0/ISADotNet.Json.Tests.dll"

#load "../ISADotNet_public/tests/ISADotNet.Json.Tests/TestObjects/Investigation.fs"

open JsonLD.Core
open Newtonsoft.Json.Linq
open System

let inv_ = ISADotNet.Json.Investigation.fromString TestObjects.Investigation.investigationLD

let inv = ISADotNet.Investigation.make inv_.ID inv_.FileName inv_.Identifier inv_.Title inv_.Description inv_.SubmissionDate inv_.PublicReleaseDate inv_.OntologySourceReferences inv_.Publications inv_.Contacts None inv_.Comments inv_.Remarks
// let inv = inv_

// printfn "%A" inv

let invJson = ISADotNet.Json.Investigation.toStringLD inv
let invJsonWithContext = ISADotNet.Json.Investigation.toStringLDWithContext inv
let invRoCrate = ISADotNet.Json.Investigation.toStringRoCrate inv
// let invContext = IO.File.ReadAllText("json_context/sdo/isa_investigation_sdo_context.jsonld")

let invJ = JObject.Parse(invJson)
let invJC = JObject.Parse(invJsonWithContext)
let invJR = JObject.Parse(invRoCrate)


// printfn "%s" (invJC.ToString())
// printfn "%s" (invJR.ToString())
// printfn "%s" (contextJ.ToString())
// #quit;;

let opts = JsonLdOptions()

// let invFlat = JsonLdProcessor.Flatten(invJ,contextJ,opts)
// let invFlatC = JsonLdProcessor.Flatten(invJC,contextJ,opts)
let invFlatC = JsonLdProcessor.Flatten(invJR,"https://w3id.org/ro/crate/1.1/context",opts)

printfn "%s" (invFlatC.ToString())