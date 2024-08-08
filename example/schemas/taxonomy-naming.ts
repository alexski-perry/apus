import { boolean, string } from "@schema/property";
import { relation_one } from "@schema/relation";
import * as Taxonomy from "./taxonomy";
import { abstract_node, node, relationship } from "@schema/entity-config";
import { BaseNode } from "../BaseNode";
import { $ } from "@schema/inherit-mixin";

// @formatter:off

export class NAMED_LOCAL {
  $ = relationship({name: "NAMED_LOCAL"})
}
export class NAMED_SCIENTIFIC {
  $ = relationship({name: "NAMED_SCIENTIFIC"})
}

export class TaxonName extends $(BaseNode) {
  $ = abstract_node({identifier: "TaxonName", subtypes: [TaxonGroupLocalName, SpeciesName]})

  value = string();
}

export class TaxonGroupLocalName extends $(TaxonName) {
  $ = node({label: "TaxonGroupLocalName"})

  isMain   = boolean();
  language = string();
  of       = relation_one(NAMED_LOCAL, "<-", Taxonomy.TaxonGroup);
}

export class SpeciesName extends $(TaxonName) {
  $ = abstract_node({
    identifier: "SpeciesName",
    passOnLabel: true,
    subtypes: [SpeciesScientificName, SpeciesLocalName]
  })
}

export class SpeciesScientificName extends $(SpeciesName) {
  $ = node({label: "SpeciesScientificName"})

  of = relation_one(NAMED_SCIENTIFIC, "<-", Taxonomy.Species);
}

export class SpeciesLocalName extends $(SpeciesName) {
  $ = node({label: "SpeciesLocalName"})

  isMain   = boolean();
  language = string();
  of       = relation_one(NAMED_LOCAL, "<-", Taxonomy.Species);
}