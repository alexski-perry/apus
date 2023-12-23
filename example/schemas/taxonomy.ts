import * as TaxonNaming from "./taxonomy-naming";
import { Interface, Node, NodeUnion, Relationship } from "neo4j-querier";
import { relation_many, relation_one, string } from "neo4j-querier/fields";
import { WithID } from "@schema/presets";

// @formatter:off

export class MEMBER_OF extends Relationship("MEMBER_OF") {}
export class IN_FAMILY extends Relationship("IN_FAMILY") {}
export class IN_GENUS extends Relationship("IN_GENUS") {}
export class IN_ORDER extends Relationship("IN_ORDER") {}
export class OF_SPECIES extends Relationship("OF_SPECIES") {}
export class REPRESENTS_TAXONS extends Relationship("REPRESENTS_TAXONS") {}
export class CLASSIFIES_TAXONS extends Relationship("CLASSIFIES_TAXONS") {}

export class Taxon extends Interface(WithID) {
  $subtypes = { TaxonomicGrouping, Species, Subspecies };

  name = string();

  parent   = relation_one(MEMBER_OF, "->", Taxon);
  children = relation_many(MEMBER_OF, "<-", Taxon);
}

export class TaxonomicGrouping extends Node("TaxonomicGrouping", Taxon) {
  /* @ts-ignore */
  $subtypes = { Genus, Family, Order };

  local_names = relation_many(TaxonNaming.NAMED_LOCAL, "->", TaxonNaming.TaxonGroupLocalName);
}

export class Genus extends Node("Genus", TaxonomicGrouping) {
  family  = relation_one(IN_FAMILY, "->", Family);
  species = relation_many(IN_GENUS, "<-", Species);
}

export class Family extends Node("Family", TaxonomicGrouping) {
  order  = relation_one(IN_ORDER, "->", Order);
  genera = relation_many(IN_FAMILY, "<-", Genus);
}

export class Order extends Node("Order", TaxonomicGrouping) {
  families = relation_many(IN_ORDER, "<-", Family);
}

export const SpeciesLike = NodeUnion(() => ({ Species, Subspecies }));

export class Species extends Node("Species", Taxon) {
  genus           = relation_one(IN_GENUS, "->", Genus);
  subspecies      = relation_many(OF_SPECIES, "<-", Subspecies);
  scientific_name = relation_one(TaxonNaming.NAMED_SCIENTIFIC, "->", TaxonNaming.SpeciesScientificName);
  local_names     = relation_many(TaxonNaming.NAMED_LOCAL, "->", TaxonNaming.SpeciesLocalName);
}

export class Subspecies extends Node("Subspecies", Taxon) {
  species         = relation_one(OF_SPECIES, "->", Species);
  scientific_name = relation_one(TaxonNaming.NAMED_SCIENTIFIC, "->", TaxonNaming.SpeciesScientificName);
  local_names     = relation_many(TaxonNaming.NAMED_LOCAL, "->", TaxonNaming.SpeciesLocalName);
}

export class FolkClassification extends Node("FolkClassification") {
  name = string();

  classifies = relation_many(REPRESENTS_TAXONS, "->", TaxonomicGrouping);
}


export class SpeciesCategory extends Node("SpeciesCategory") {
  name = string();

  represents = relation_one(CLASSIFIES_TAXONS, "->", NodeUnion(() => ({TaxonomicGrouping, FolkClassification})));
}
