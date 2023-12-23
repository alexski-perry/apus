import { Definition, Relation, RelationDeleteStrategy, RelationDirection } from "./index";
import { ConstructorOf } from "@utils/ConstructorOf";

export const relation_one = <
  TRelationship extends Definition<"relationship">,
  TDirection extends RelationDirection,
  TTo extends Definition<"node" | "node-union" | "abstract-node" | "node-interface">,
>(
  relationship: ConstructorOf<TRelationship>,
  direction: TDirection,
  to: ConstructorOf<TTo>,
  deletionStrategy: RelationDeleteStrategy = "disconnect",
): Relation<{
  relationship: TRelationship;
  direction: TDirection;
  to: TTo;
  cardinality: "one";
}> =>
  new Relation({
    relationship,
    direction,
    to,
    deletionStrategy,
    cardinality: "one",
  });

export const relation_many = <
  TRelationship extends Definition<"relationship">,
  TDirection extends RelationDirection,
  TTo extends Definition<"node" | "node-union" | "abstract-node" | "node-interface">,
>(
  relationship: ConstructorOf<TRelationship>,
  direction: TDirection,
  to: ConstructorOf<TTo>,
  deletionStrategy: RelationDeleteStrategy = "disconnect",
): Relation<{
  relationship: TRelationship;
  direction: TDirection;
  to: TTo;
  cardinality: "many";
}> =>
  new Relation({
    relationship,
    direction,
    to,
    deletionStrategy,
    cardinality: "many",
  });

export const relation_optional = <
  TRelationship extends Definition<"relationship">,
  TDirection extends RelationDirection,
  TTo extends Definition<"node" | "node-union" | "abstract-node" | "node-interface">,
>(
  relationship: ConstructorOf<TRelationship>,
  direction: TDirection,
  to: ConstructorOf<TTo>,
  deletionStrategy: RelationDeleteStrategy = "disconnect",
): Relation<{
  relationship: TRelationship;
  direction: TDirection;
  to: TTo;
  cardinality: "optional";
}> =>
  new Relation({
    relationship,
    direction,
    to,
    deletionStrategy,
    cardinality: "optional",
  });
