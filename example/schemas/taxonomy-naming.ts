import { boolean, relation_one, string } from "neo4j-querier/fields";
import * as Taxonomy from "./taxonomy";
import { AbstractNode, Interface, Node, Relationship } from "neo4j-querier";

// @formatter:off

export class NAMED_LOCAL extends Relationship("NAMED_LOCAL") {}
export class NAMED_SCIENTIFIC extends Relationship("NAMED_SCIENTIFIC") {}

export class TaxonName extends Interface() {
  $subtypes = { TaxonGroupName, SpeciesName };

  value = string();
}

export class TaxonGroupName extends AbstractNode("TaxonGroupName", TaxonName) {
  // @ts-ignore
  $subtypes = { TaxonGroupScientificName, TaxonGroupLocalName };
}

export class TaxonGroupScientificName extends Node("TaxonGroupScientificName", TaxonGroupName) {
  of = relation_one(NAMED_SCIENTIFIC, "<-", Taxonomy.TaxonomicGrouping);
}

export class TaxonGroupLocalName extends Node("TaxonGroupLocalName", TaxonGroupName) {
  isMain   = boolean();
  language = string();
  of       = relation_one(NAMED_LOCAL, "<-", Taxonomy.TaxonomicGrouping);
}

export class SpeciesName extends Interface(TaxonName) {
  // @ts-ignore
  $subtypes = { SpeciesScientificName, SpeciesLocalName };
}

export class SpeciesScientificName extends Node("SpeciesScientificName", SpeciesName) {
  of = relation_one(NAMED_SCIENTIFIC, "<-", Taxonomy.SpeciesLike);
}

export class SpeciesLocalName extends Node("SpeciesLocalName", SpeciesName) {
  isMain   = boolean();
  language = string();
  of       = relation_one(NAMED_LOCAL, "<-", Taxonomy.SpeciesLike);
}
