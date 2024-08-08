import * as TaxonNaming from "./taxonomy-naming";
import { relation_many, relation_one, relation_optional } from "@schema/relation";
import { string, string_optional } from "@schema/property";
import { abstract_node, node, node_union, relationship } from "@schema/entity-config";
import { $ } from "@schema/inherit-mixin";
import { BaseNode } from "../BaseNode";
import { stringConst } from "@cypher/expression/constant";

// @formatter:off

export class MEMBER_OF {
  $ = relationship({name: "MEMBER_OF"});
}

export class IN_FAMILY {
  $ = relationship({name: "IN_FAMILY"});
}

export class IN_GENUS {
  $ = relationship({name: "IN_GENUS"});
}

export class IN_ORDER {
  $ = relationship({name: "IN_ORDER"});
}

export class OF_SPECIES {
  $ = relationship({name: "OF_SPECIES"});
}

export class REPRESENTS_TAXONS {
  $ = relationship({name: "REPRESENTS_TAXONS"});
}

export class CLASSIFIES_TAXONS {
  $ = relationship({name: "CLASSIFIES_TAXONS"});
}

export class Taxon extends $(BaseNode) {
  $ = abstract_node({
    identifier: "Taxon",
    passOnLabel: true,
    subtypes: [TaxonGroup, Species, Subspecies]
  })

  name        = string();

  parent      = relation_optional(MEMBER_OF, "->", Taxon);
  children    = relation_many(MEMBER_OF, "<-", Taxon);
}

export class TaxonGroup extends $(Taxon) {
  $ = node({
    label: "TaxonGroup",
    subtypes: [Genus, Family, Order]
  })

  local_names = relation_many(TaxonNaming.NAMED_LOCAL, "->", TaxonNaming.TaxonGroupLocalName)
}


export class Genus extends $(TaxonGroup) {
  $ = node({label: "Genus"})

  family  = relation_one(IN_FAMILY, "->", Family);
  species = relation_many(IN_GENUS, "<-", Species);
}

export class Family extends $(TaxonGroup) {
  $ = node({label: "Family"})

  order  = relation_one(IN_ORDER, "->", Order);
  genera = relation_many(IN_FAMILY, "<-", Genus);
}

export class Order extends $(TaxonGroup) {
  $ = node({label: "Order"})

  families = relation_many(IN_ORDER, "<-", Family);
}

export class SpeciesLike {
  $ = node_union(Species, Subspecies);
}

export class Species extends $(Taxon) {
  $ = node({label: "Species"})

  genus           = relation_one(IN_GENUS, "->", Genus);
  subspecies      = relation_many(OF_SPECIES, "<-", Subspecies);
  scientific_name = relation_one(TaxonNaming.NAMED_SCIENTIFIC, "->", TaxonNaming.SpeciesScientificName);
  local_names     = relation_many(TaxonNaming.NAMED_LOCAL, "->", TaxonNaming.SpeciesLocalName);
}

export class Subspecies extends $(Taxon) {
  $ = node({label: "Subspecies"})

  species         = relation_one(OF_SPECIES, "->", Species);
  scientific_name = relation_one(TaxonNaming.NAMED_SCIENTIFIC, "->", TaxonNaming.SpeciesScientificName);
  local_names     = relation_many(TaxonNaming.NAMED_LOCAL, "->", TaxonNaming.SpeciesLocalName);
}

export class SpeciesCategory extends $(BaseNode) {
  $ = node({label: "SpeciesCategory"})

  name       = string();
  // TODO unionOf
  // represents = relation_one(REPRESENTS_TAXONS, "->", unionOf(Taxon, FolkClassification));
}

export class FolkClassification extends $(BaseNode) {
  $ = node({label: "FolkClassification"})

  name       = string();
  classifies = relation_many(CLASSIFIES_TAXONS, "->", Taxon);
}