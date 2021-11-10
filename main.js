#!/usr/bin/env node
'use strict';

const fs = require('fs');
const PATH = require('path');
const SPAWN = require('child_process').spawn;
const intputPath = process.argv[2] || '';
const root = PATH.isAbsolute(intputPath) ? intputPath: PATH.join(process.cwd(),intputPath);

// Note that all @id identifiers must be valid URI references, care must be taken to express any relative paths using / separator, correct casing, and escape special characters like space (%20) and percent (%25), for instance a File Data Entity from the Windows path Results and Diagrams\almost-50%.png becomes "@id": "Results%20and%20Diagrams/almost-50%25.png" in the RO-Crate JSON-LD.
const toValidId = text => encodeURI(text);

const getRef = id => {
  return {"@id": typeof id==='object' ? id["@id"] : id};
};

const finalizeRoc = roc=>{
  const graphAsMap = roc['@graph'];
  const graphAsList = [];
  for(let x of Object.keys(graphAsMap))
    graphAsList.push(graphAsMap[x]);
  roc['@graph'] = graphAsList;
};

async function convert(arcJson){

    const roc = {
      "@context": "https://w3id.org/ro/crate/1.1/context",
      "@graph": {

        "ro-crate-metadata.json" : {
            "@type": "CreativeWork",
            "@id": "ro-crate-metadata.json",
            "conformsTo": {"@id": "https://w3id.org/ro/crate/1.1"},
            "about": {"@id": "./"},
            "description": "RO-Crate Metadata File Descriptor"
        },

        "./" : {
          "@id": "./",
          "@type": "Dataset",
          "author": [],
          "citation": [],
          "hasPart": []
        }
      }
    };

    const graph = roc['@graph'];
    const addNode = obj => {
      graph[obj["@id"]] = obj;
    };
    const rootDataEntity = graph['./'];

    // name: SHOULD identify the dataset to humans well enough to disambiguate it from other RO-Crates
    rootDataEntity.name = arcJson.identifier;
    rootDataEntity.title = arcJson.title;

    // description: SHOULD further elaborate on the name to provide a summary of the context in which the dataset is important.
    rootDataEntity.description = arcJson.description;

    // For a Root Data Entity, an identifier which is RECOMMENDED to be a https://doi.org/ URI.
    // TODO: improve with doi
    // rootDataEntity.identifier = arcJson.identifier;

    // datePublished: MUST be a string in ISO 8601 date format and SHOULD be specified to at least the precision of a day, MAY be a timestamp down to the millisecond.
    rootDataEntity.datePublished = new Date(arcJson.publicReleaseDate).toISOString();

    // license: SHOULD link to a Contextual Entity in the RO-Crate Metadata File with a name and description. MAY have a URI (eg for Creative Commons or Open Source licenses). MAY, if necessary be a textual description of how the RO-Crate may be used.
    rootDataEntity.license = "TODO";
    
    // add arc authors
    for(let person of arcJson.people){
      rootDataEntity.author.push(
        person.orcid ? getRef(person.orcid) : person.firstName+" "+person.lastName
      );
    }

    // add publications
    for(let publication of arcJson.publications){
      if(publication.doi) rootDataEntity.citation.push(
        getRef(publication.doi)
      );
    }

    // add assays
    for(let study of arcJson.studies){
      for(let assay of study.assays){
        // get assay data
        const name = study.identifier
        const assayPath = toValidId(assay.filename.split('/')[0]);
        const metadatafile = toValidId(assay.filename.split('/')[1]);
        const id = toValidId("assays/"+assayPath+"/");
        // get assay metadata
        const measurementAnnotationValue = assay.measurementType.annotationValue;
        const measurementTermAccession = assay.measurementType.termAccession;
        const measurementTermSource = assay.measurementType.termSource;
        const technologyAnnotationValue = assay.technologyType.annotationValue;
        const technologyTermAccession = assay.technologyType.termAccession;
        const technologyTermSource = assay.technologyType.termSource;
        const technologyPlatform = assay.technologyPlatform;
        // build roc objects for assay
        const rocAssay = {
          "@id": id,
          "@type": "Dataset",
          "name": name,
          "description": 'TODO',
          "author": [],
          "measurementType": getRef(measurementTermAccession),
          "technologyType": getRef(technologyTermAccession),
          "technologyPlatform": technologyPlatform,
          "hasPart": []
        };
        const rocAssayFile = {
          "@id": metadatafile,
          "@type": "File",
          "name": name,
          "description": 'ISA metadata for Assay',
          "rawDataFiles": []
        };
        for(let person of study.people){
          rocAssay.author.push(
            person.orcid ? getRef(person.orcid) : person.firstName+" "+person.lastName
          );
        }
        let rawFiles = [];
        for(let process of assay.processSequence){
          for(let output of process.outputs){
            if(output.type == "Raw Data File"){
              const rocRawDataFile = {
                "@id": output.name,
                "@type": "File",
                "name": output.name,
                "description": 'Raw Data File'
              };
              rawFiles.push(rocRawDataFile);
              let rawFileRef = getRef(rocRawDataFile);
              if(!rocAssayFile.rawDataFiles.some(ref => ref["@id"]==output.name)) rocAssayFile.rawDataFiles.push(rawFileRef);
              if(!rocAssay.hasPart.some(ref => ref["@id"]==output.name)) rocAssay.hasPart.push(rawFileRef);
            }
          }
        }
        // modify graph
        graph['./'].hasPart.push(getRef(rocAssay));
        rocAssay.hasPart.push(getRef(rocAssayFile));
        addNode(rocAssay);
        addNode(rocAssayFile);
        for(let rawFile of rawFiles){
          if(graph[rawFile["@id"]]==null) addNode(rawFile);
        }
        // add metadata objects to roc if necessary
        if(graph[measurementTermAccession]==null){
            const rocMeasurementType = {
              "@id": measurementTermAccession,
              "@type": "MeasurementType",
              "annotationValue": measurementAnnotationValue,
              "termSource": measurementTermSource
            };
            addNode(rocMeasurementType);
        }
        if(graph[technologyTermAccession]==null){
            const rocTechnologyType = {
              "@id": technologyTermAccession,
              "@type": "TechnologyType",
              "annotationValue": technologyAnnotationValue,
              "termSource": technologyTermSource
            };
            addNode(rocTechnologyType);
        }
      }
    }
    
    finalizeRoc(roc);
    
    console.log(roc);
    fs.writeFileSync('ro-crate-metadata.json', JSON.stringify(roc,null,1), 'UTF-8');
}

function getArcJson(){
  console.log(`Retrieving arc.json`);
  const arcProcess = SPAWN('arc', ['-v','0','export'] , {cwd:root});
  let jsonAsString = '';
  arcProcess.stdout.setEncoding('utf8');
  arcProcess.stdout.on('data', data=>jsonAsString+=data.toString());
  arcProcess.stderr.setEncoding('utf8');
  arcProcess.stderr.on('data', data=>console.error(data));
  arcProcess.on('close', code => convert(JSON.parse(jsonAsString)));
}

getArcJson();
