import { ConstructorOf } from "@utils/ConstructorOf";
import { Definition } from "./definition";
import { Cardinality } from "@core";

export type RelationCardinality = "one" | "optional" | "many";
export type RelationDirection = "->" | "<-";
export type RelationDeleteStrategy = "disconnect" | "cascade" | "no-delete";

export interface RelationDefinition {
  to: ConstructorOf<Definition<"node" | "node-interface" | "abstract-node" | "node-union">>;
  cardinality: RelationCardinality;
  direction: RelationDirection;
  relationship: ConstructorOf<Definition<"relationship">>;
  deletionStrategy: RelationDeleteStrategy;
}

export interface RelationTypeInfo {
  to: Definition<"node" | "node-interface" | "abstract-node" | "node-union">;
  cardinality: RelationCardinality;
  direction: RelationDirection;
  relationship: Definition<"relationship">;
}

export class Relation<TypeInfo extends RelationTypeInfo> {
  private declare type: TypeInfo;

  constructor(private definition: RelationDefinition) {}

  static getDefinition(relation: Relation<any>): RelationDefinition {
    return relation.definition;
  }
}
