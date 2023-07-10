# ISA-Investigation RO-crate profile

## Abstract

The [`ISA-Investigation RO-crate profile`]() is the [`schema.org`](https://schema.org/) compatible representation of an [`ISA`](https://isa-specs.readthedocs.io/en/latest/index.html) investigation.

The ISA specification describes a metadata framework, which can be used to annotate life science experiments.

The investigation covers the top-level metadata of an experimental setup and is used to group underlying studies and assays ([`schema.org`](https://schema.org/) representations pending). It should be used as the [`root data entity`](https://www.researchobject.org/ro-crate/1.1/root-data-entity.html) and contain the study and assay subfolders through the typical RO-crate conventions ([`hasPart`](https://schema.org/hasPart) relationships).



## Properties

- [`Dataset`](http://schema.org/dataset)
  - [`identifier`](http://schema.org/identifier): [`Text`](https://schema.org/Text) or [`URL`](https://schema.org/URL) (required)
  - [`headline`](http://schema.org/headline): [`Text`](https://schema.org/Text) (required)
  - [`description`](http://schema.org/description): [`Text`](https://schema.org/Text) (required)
  - [`alternateName`](https://schema.org/alternateName): [`Text`](https://schema.org/Text) (required)

  - [`creator`](http://schema.org/creator): [`Person`](https://schema.org/Person) (recommended)
  - [`mentions`](http://schema.org/mentions): [`DefinedTermSet`](https://schema.org/DefinedTermSet) (recommended)

  - [`dateCreated`](http://schema.org/dateCreated): [`Date`](https://schema.org/Date) or [`DateTime`](https://schema.org/DateTime) (optional)
  - [`datePublished`](http://schema.org/datePublished): [`Date`](https://schema.org/Date) or [`DateTime`](https://schema.org/DateTime) (optional)
  - [`citation`](http://schema.org/citation): [`ScholarlyArticle`](https://schema.org/ScholarlyArticle) (optional)
  - [`disambiguatingDescription`](http://schema.org/disambiguatingDescription): [`Text`](https://schema.org/Text) (optional)
  - [`hasPart`](http://schema.org/hasPart): [`Dataset`](http://schema.org/dataset) (optional)

- [`Person`](http://schema.org/Person)
  - [`givenName`](http://schema.org/givenName): [`Text`](https://schema.org/Text) (required)
  - [`familyName`](http://schema.org/familyName): [`Text`](https://schema.org/Text) (required)
  
  - [`email`](http://schema.org/email): [`Text`](https://schema.org/Text) (recommended)
  - [`affiliation`](http://schema.org/affiliation): [`Organization`](https://schema.org/Organization) (recommended) 
  - [`jobTitle`](http://schema.org/jobTitle): [`DefinedTerm`](https://schema.org/DefinedTerm) (recommended)
   
  - [`additionalName`](http://schema.org/additionalName): [`Text`](https://schema.org/Text) (optional)
  - [`address`](http://schema.org/address): [`PostalAddress`](https://schema.org/PostalAddress) or [`Text`](https://schema.org/Text) (optional)
  - [`telephone`](http://schema.org/telephone): [`Text`](https://schema.org/Text) (optional)
  - [`faxNumber`](http://schema.org/faxNumber): [`Text`](https://schema.org/Text) (optional)
  - [`disambiguatingDescription`](http://schema.org/disambiguatingDescription): [`Text`](https://schema.org/Text) (optional)
  
- [`ScholarlyArticle`](http://schema.org/ScholarlyArticle)
  - [`sameAs`](http://schema.org/sameAs): [`URL`](https://schema.org/URL) (required)
  - [`headline`](http://schema.org/headline): [`Text`](https://schema.org/Text) (required)
  - [`author`](http://schema.org/author): [`Person`](https://schema.org/Person) (required)
   
  - [`url`](http://schema.org/url): [`URL`](https://schema.org/URL) (recommended)
   
  - [`creativeWorkStatus`](http://schema.org/creativeWorkStatus): [`DefinedTerm`](https://schema.org/DefinedTerm) (optional)
  - [`disambiguatingDescription`](http://schema.org/disambiguatingDescription): [`Text`](https://schema.org/Text) (optional)


