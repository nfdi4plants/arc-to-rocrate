#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;

if(process.argv[2] !== '-p'){
  console.log('Usage: arc-to-roc -p PATH/TO/ARC');
  process.exit();
}
const intputPath = process.argv[3] || '';
const root = path.isAbsolute(intputPath) ? intputPath: path.join(process.cwd(),intputPath);

//==================================================================================================================
//==================================================================================================================

// Note that all @id identifiers must be valid URI references, care must be taken to express any relative paths using / separator, correct casing, and escape special characters like space (%20) and percent (%25), for instance a File Data Entity from the Windows path Results and Diagrams\almost-50%.png becomes "@id": "Results%20and%20Diagrams/almost-50%25.png" in the RO-Crate JSON-LD.
const toValidId = text => encodeURI(text);

const getRef = id => {
  return {"@id": typeof id==='object' ? id["@id"] : id};
};

const getPersonId = person => {
    if(person.orcid)       return person.orcid;
    if(person.midInitials) return "#"+(person.firstName.replace(/\s/g,"_"))+"_"+(person.midInitials.replace(/\s/g,"_"))+"_"+(person.lastName.replace(/\s/g,"_"));
    else                   return "#"+(person.firstName.replace(/\s/g,"_"))+"_"+(person.lastName.replace(/\s/g,"_"));
}

const getRocPerson = person => {
    const personID = getPersonId(person);
    const rocPerson = {
      "@id": personID,
      "@type": "Person",
      "givenName": person.firstName,
      "familyName": person.lastName
    };
    if(person.midInitials) rocPerson["additionalName"] = person.midInitials;
    if(person.email) rocPerson["email"] = person.email;
    if(person.fax) rocPerson["faxNumber"] = person.fax;
    if(person.phone) rocPerson["telephone"] = person.phone;
    if(person.address) rocPerson["address"] = person.address;
    if(person.affiliation) rocPerson["affiliation"] = person.affiliation;
    if(person.orcid) rocPerson["identifier"] = person.orcid;
    return rocPerson;
}

const traverseProcessGraph = processSequence => {
    let sources = new Map();
    let samples = new Map();
    let datafiles = new Map();
    let protocols = new Map();
    for(let process of processSequence){
        if(!process.inputs) continue;
        for(let input of process.inputs){
            if(input.characteristics){
                sources.set(input.name,input);
            }
            if(input.derivesFrom){
                if(!samples.get(input.name)) samples.set(input.name,new Set());
            }
        }
        let i=0;
        for(let output of process.outputs){
            if(!protocols.get(output.name)) protocols.set(output.name,new Set());
            protocols.get(output.name).add(process.executesProtocol.name);
            if(output.derivesFrom){
                if(!samples.get(output.name)) samples.set(output.name,new Set());
                if(process.inputs){
                    samples.get(output.name).add(process.inputs[i].name);
                    if(samples.get(process.inputs[i].name)) for(let pred of samples.get(process.inputs[i].name)){
                        samples.get(output.name).add(pred);
                    }
                    if(protocols.get(process.inputs[i].name)) for(let predProtocols of protocols.get(process.inputs[i].name)){
                        protocols.get(output.name).add(predProtocols);
                    }
                }
            }
            else{
                if(!datafiles.get(output.name)) datafiles.set(output.name,new Set());
                if(process.inputs) datafiles.get(output.name).add(process.inputs[i].name);
                if(process.inputs){
                    datafiles.get(output.name).add(process.inputs[i].name);
                    if(samples.get(process.inputs[i].name)) for(let pred of samples.get(process.inputs[i].name)){
                        datafiles.get(output.name).add(pred);
                    }
                    if(protocols.get(process.inputs[i].name)) for(let predProtocols of protocols.get(process.inputs[i].name)){
                        protocols.get(output.name).add(predProtocols);
                    }
                }
            }
            i++;
        }
    }
    let sourcesPerDatafile = new Map();
    let protocolsPerDatafile = new Map();
    for(let [file,preds] of datafiles.entries()){
        for(let pred of preds){
            sourcesPerDatafile.set(file,new Set());
            if(sources.get(pred)){
                let organism = undefined;
                for(let c of sources.get(pred).characteristics){
                    if(c.category.characteristicType.annotationValue=='Organism') organism = c.value;
                }
                sourcesPerDatafile.get(file).add([pred,organism]);
            }
            protocolsPerDatafile.set(file,[...(protocols.get(file))]);
        }
    }
    for(let file of sourcesPerDatafile.keys()){
        sourcesPerDatafile.set(file,Array.from(sourcesPerDatafile.get(file)));
    }
    return [sourcesPerDatafile,protocolsPerDatafile];
}

const finalizeRoc = roc=>{
  const graphAsMap = roc['@graph'];
  const graphAsList = [];
  for(let x of Object.keys(graphAsMap))
    graphAsList.push(graphAsMap[x]);
  roc['@graph'] = graphAsList;
};

//==================================================================================================================
//==================================================================================================================

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
          "hasPart": [],
          "about": []
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
      if(person.orcid) rootDataEntity.author.push( getRef(person.orcid) );
      else{
        const personID = getPersonId(person);
        if(graph[personID]==null){
            const rocPerson = getRocPerson(person);
            addNode(rocPerson);
        }
        rootDataEntity.author.push( getRef(personID) );
      }
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
        const name = study.identifier;
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
          "variableMeasured": measurementAnnotationValue,
          "measurementTechnique": technologyTermSource,
          "technologyPlatform": technologyPlatform,
          "hasPart": [],
          "about": []
        };
        const rocAssayFile = {
          "@id": metadatafile,
          "@type": "File",
          "name": name,
          "description": 'ISA metadata for Assay',
          "rawDataFiles": []
        };
        
        // add persons to roc assay
        for(let person of study.people){
          if(person.orcid) rocAssay.author.push( getRef(person.orcid) );
          else{
            const personID = getPersonId(person);
            if(graph[personID]==null){
                const rocPerson = getRocPerson(person);
                addNode(rocPerson);
            }
            rocAssay.author.push( getRef(personID) );
          }
        }
        
        // get raw files from process sequence and add files and metadata to roc
        let rawFiles = [];
        let filesMetaData = traverseProcessGraph(assay.processSequence);
        for(let process of assay.processSequence){
          for(let output of process.outputs){
            if(output.type == "Raw Data File"){
              let sources = filesMetaData[0].get(output.name);
              let protocols = filesMetaData[1].get(output.name);
              const rocRawDataFile = {
                "@id": output.name,
                "@type": "File",
                "name": output.name,
                "description": 'Raw Data File',
                "sourceNames": [],
                "sourceOrganisms": [],
                "protocols": []
              };
              for(let source of sources){
                  if(source[0]) rocRawDataFile["sourceNames"].push(source[0]);
                  //if(source[1]) rocRawDataFile["sourceOrganisms"].push(source[1]);
                  let organismID = "#"+(source[1].replace(/\s/g,"_"));
                  if(graph[organismID]==null){
                      const rocOrganism = {
                        "@id": organismID,
                        //"@type": "BioChemEntity",
                        "@type": "Taxon",
                        "name": source[1],
                        "description": 'Organsim investigated'
                      };
                      addNode(rocOrganism);
                      rootDataEntity.about.push(getRef(rocOrganism));
                  }
                  if(!(rocAssay.about.some(x => x["@id"] == organismID))) rocAssay.about.push(getRef(organismID));
                  if(source[1]) rocRawDataFile["sourceOrganisms"].push(getRef(organismID));
              }
              if(protocols){
                  //rocRawDataFile["protocols"] = protocols;
                  for(let protocol of protocols){
                      let protocolID = "#"+(protocol.replace(/\s/g,"_"));
                      if(graph[protocolID]==null){
                          const rocProtocol = {
                            "@id": protocolID,
                            "@type": "LabProtocol",
                            "name": protocol,
                            "description": 'ToDo'
                          };
                          addNode(rocProtocol);
                          rootDataEntity.about.push(getRef(rocProtocol));
                      }
                      if(!(rocAssay.about.some(x => x["@id"] == protocolID))) rocAssay.about.push(getRef(protocolID));
                      rocRawDataFile["protocols"].push(getRef(protocolID));
                  }
              }
              rawFiles.push(rocRawDataFile);
              let rawFileRef = getRef(rocRawDataFile);
              if(!rocAssayFile.rawDataFiles.some(ref => ref["@id"]==output.name)) rocAssayFile.rawDataFiles.push(rawFileRef);
              if(!rocAssay.hasPart.some(ref => ref["@id"]==output.name)) rocAssay.hasPart.push(rawFileRef);
            }
          }
        }
        
        // modify graph
        graph['./'].hasPart.push(getRef(rocAssay));
        //rocAssay.hasPart.push(getRef(rocAssayFile));
        addNode(rocAssay);
        //addNode(rocAssayFile);
        for(let rawFile of rawFiles){
          if(graph[rawFile["@id"]]==null) addNode(rawFile);
        }
        // add metadata objects to roc if necessary
        /*if(graph[measurementTermAccession]==null){
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
        }*/
      }
    }

    finalizeRoc(roc);

    console.log(roc);
    fs.writeFileSync('ro-crate-metadata.json', JSON.stringify(roc,null,1), 'UTF-8');
}

function getArcJson(){
  console.log(`Retrieving arc.json`);
  const arcProcess = spawn('arc', ['-v','0','export'] , {cwd:root});
  let jsonAsString = '';
  arcProcess.stdout.setEncoding('utf8');
  arcProcess.stdout.on('data', data=>jsonAsString+=data.toString());
  arcProcess.stderr.setEncoding('utf8');
  arcProcess.stderr.on('data', data=>console.error(data));
  arcProcess.on('close', code => convert(JSON.parse(jsonAsString)));
}

//==================================================================================================================
//==================================================================================================================

getArcJson();
