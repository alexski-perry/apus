import {
  AbstractNodeDefinitionClass,
  NodeDefinitionClass,
  NodeUnionDefinitionClass,
  RelationDefinition,
  RelationDeleteStrategy,
  RelationDirection,
  RelationshipDefinitionClass,
  RelationTypeInfo,
} from "@schema/definition";
import { Deconstruct } from "@utils/deconstruct";

export const relation_one = <
  TRelationship extends RelationshipDefinitionClass,
  TDirection extends RelationDirection,
  TTo extends NodeDefinitionClass | AbstractNodeDefinitionClass | NodeUnionDefinitionClass,
>(
  relationship: TRelationship,
  direction: TDirection,
  to: TTo,
  deletionStrategy: RelationDeleteStrategy = "disconnect",
): RelationDefinition<{
  relationship: Deconstruct<TRelationship>;
  direction: TDirection;
  to: Deconstruct<TTo>;
  cardinality: "one";
}> => {
  return {
    kind: "Relation",
    __typeInfo: null as any,
    relationship,
    direction,
    to,
    deletionStrategy,
    cardinality: "one",
  } satisfies RelationDefinition<RelationTypeInfo>;
};

export const relation_many = <
  TRelationship extends RelationshipDefinitionClass,
  TDirection extends RelationDirection,
  TTo extends NodeDefinitionClass | AbstractNodeDefinitionClass | NodeUnionDefinitionClass,
>(
  relationship: TRelationship,
  direction: TDirection,
  to: TTo,
  deletionStrategy: RelationDeleteStrategy = "disconnect",
): RelationDefinition<{
  relationship: Deconstruct<TRelationship>;
  direction: TDirection;
  to: Deconstruct<TTo>;
  cardinality: "many";
}> => {
  return {
    kind: "Relation",
    __typeInfo: null as any,
    relationship,
    direction,
    to,
    deletionStrategy,
    cardinality: "many",
  } satisfies RelationDefinition<RelationTypeInfo>;
};

export const relation_optional = <
  TRelationship extends RelationshipDefinitionClass,
  TDirection extends RelationDirection,
  TTo extends NodeDefinitionClass | AbstractNodeDefinitionClass | NodeUnionDefinitionClass,
>(
  relationship: TRelationship,
  direction: TDirection,
  to: TTo,
  deletionStrategy: RelationDeleteStrategy = "disconnect",
): RelationDefinition<{
  relationship: Deconstruct<TRelationship>;
  direction: TDirection;
  to: Deconstruct<TTo>;
  cardinality: "optional";
}> => {
  return {
    kind: "Relation",
    __typeInfo: null as any,
    relationship,
    direction,
    to,
    deletionStrategy,
    cardinality: "optional",
  } satisfies RelationDefinition<RelationTypeInfo>;
};
