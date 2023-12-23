import { constructorOf, ConstructorOf } from "@utils/ConstructorOf";
import {
  Definition,
  NodeLikeOrUnionDefinition,
  RelationshipDefinition,
} from "@schema/definition";
import { Deconstruct } from "@utils/deconstruct";
import {
  GraphNode,
  GraphNodeUnion,
  GraphRelationship,
  NodeUnionValue,
  NodeValue,
  RelationshipValue,
  UntypedNode,
  UntypedRelationship,
} from "@cypher/types";
import {
  loadNodeLikeOrUnionModel,
  loadRelationshipModel,
  NodeLikeOrUnionModel,
  RelationshipModel,
} from "@schema/models";
import { TypeOf } from "@core/type";
import { ObjectQueryData, QueryData, Value } from "@core";
import { Null } from "@cypher/types/null";
import { Pair } from "@cypher/types/pair";
import { Triple } from "@cypher/types/triple";
import { Map } from "@cypher/types/map";

export type ValueFromQueryData<T extends QueryData> = T extends Value
  ? T
  : T extends void
  ? Null
  : T extends ObjectQueryData
  ? Map<{ [K in keyof T]: ValueFromQueryData<T[K]> }>
  : T extends [infer T1 extends Value, infer T2 extends Value]
  ? Pair<T1, T2>
  : T extends [infer T1 extends Value, infer T2 extends Value, infer T3 extends Value]
  ? Triple<T1, T2, T3>
  : never;

/**
 * Helper type to get a node value from:
 *   - string -> UntypedNode
 *   - node, abstract-node, node-interface definition/constructor -> GraphNode
 *   - node-union definition/constructor -> GraphNodeUnion
 */
export type MakeNodeValue<
  T extends
    | string
    | Definition<"node" | "abstract-node" | "node-interface" | "node-union">
    | ConstructorOf<Definition<"node" | "abstract-node" | "node-interface" | "node-union">>,
> = T extends ConstructorOf<Definition<"node" | "abstract-node" | "node-interface">>
  ? // @ts-expect-error
    GraphNode<Deconstruct<T>>
  : T extends ConstructorOf<Definition<"node-union">>
  ? // @ts-expect-error
    GraphNodeUnion<Deconstruct<T>>
  : T extends Definition<"node" | "abstract-node" | "node-interface">
  ? GraphNode<T>
  : T extends Definition<"node-union">
  ? GraphNodeUnion<T>
  : T extends string
  ? UntypedNode
  : never;

export const getNodeType = (
  input: string | NodeLikeOrUnionModel | ConstructorOf<NodeLikeOrUnionDefinition>,
): TypeOf<NodeValue> | TypeOf<NodeUnionValue> => {
  if (typeof input === "string") {
    return UntypedNode.of(input);
  }

  const model = "kind" in input ? input : loadNodeLikeOrUnionModel(input);

  switch (model.kind) {
    case "node":
    case "abstract-node":
    case "node-interface":
      return NodeValue.of(constructorOf(model.definition));
    case "node-union":
      return NodeUnionValue.of(constructorOf(model.definition));
  }
};

/**
 * Helper type to get a relationship value from:
 *   - string -> UntypedRelationship
 *   - relationship definition/constructor -> GraphRelationship
 */
export type MakeRelationshipValue<
  T extends string | Definition<"relationship"> | ConstructorOf<Definition<"relationship">>,
> = T extends ConstructorOf<Definition<any>>
  ? GraphRelationship<Deconstruct<T>>
  : T extends Definition<"relationship">
  ? GraphRelationship<T>
  : T extends string
  ? UntypedRelationship
  : never;

export const getRelationshipType = (
  input: string | RelationshipModel | ConstructorOf<RelationshipDefinition>,
): TypeOf<RelationshipValue> => {
  if (typeof input === "string") {
    return UntypedRelationship.of(input);
  }

  const model = "kind" in input ? input : loadRelationshipModel(input);
  return RelationshipValue.of(constructorOf(model.definition));
};
