import {
  DisconnectOperation,
  RelationOperation,
  RemoveOperation,
  ReplaceOperation,
} from "@cypher/mutation";
import { AllowedPropertyValue, GraphNode, NodeValue } from "@cypher/types";
import { Query, QueryStage } from "@core";
import { loadNodeLikeModel } from "@schema/models";
import { ConstructorOf } from "@utils/ConstructorOf";
import { Relation, RelationTypeInfo } from "@schema/relation";
import { Definition } from "@schema/definition";
import { Deconstruct } from "@utils/deconstruct";
import { Id } from "@utils/Id";
import { PropertyField } from "@cypher/mutation/utils/PropertyField";
import { GetUpdateFieldKind } from "@cypher/mutation/utils/GetUpdateFieldKind";
import { RelateToOperation } from "@cypher/mutation/operations/relate-to";
import { SimpleRelateToOperation } from "@cypher/mutation/operations/simple-relate-to";
import { $handleMutation } from "@cypher/mutation/utils/$handleMutation";
import { typeOf } from "@core/utils";
import { getDebugName } from "@core/type";

export const $updateNode = <TNode extends NodeValue>(
  node: TNode,
  data: NodeUpdateData<TNode extends GraphNode<infer TDef> ? ConstructorOf<TDef> : string>,
): QueryStage<void, "same", "merge"> => {
  const nodeDef = NodeValue.getDefinition(node);
  console.log({ node, nodeDef, type: getDebugName(typeOf(node)) });
  const entityModel = typeof nodeDef === "string" ? null : loadNodeLikeModel(nodeDef);

  return $handleMutation({
    entityModel,
    entityValue: node,
    data,
    mutationType: "update",
  });
};

/*
  INTERNAL TYPES
 */

type NodeUpdateData<
  T extends string | ConstructorOf<Definition<"node" | "abstract-node" | "node-interface">>,
> = T extends ConstructorOf<any> ? TypedNodeUpdateData<Deconstruct<T>> : UntypedNodeUpdateData;

type UntypedNodeUpdateData = {
  [key: string]: AllowedPropertyValue | RelationOperation | Query<NodeValue, any>;
};

type TypedNodeUpdateData<T extends Definition<"node" | "abstract-node" | "node-interface">> =
  Id<
    {
      [K in keyof T as GetUpdateFieldKind<T[K]> extends "prop" ? K : never]+?: PropertyField<
        T[K]
      >;
    } & {
      [K in keyof T as GetUpdateFieldKind<T[K]> extends "relation"
        ? K
        : never]+?: RelationUpdateField<T[K]>;
    }
  >;

type RelationUpdateField<T> = T extends Relation<infer TRelation>
  ? TRelation["cardinality"] extends "one"
    ? RelationUpdateField_One<TRelation>
    : TRelation["cardinality"] extends "optional"
    ? RelationUpdateField_Optional<TRelation>
    : TRelation["cardinality"] extends "many"
    ? RelationUpdateField_Many<TRelation> | Array<RelationUpdateField_Many<TRelation>>
    : never
  : never;

type RelationUpdateField_One<TRelation extends RelationTypeInfo> =
  | RelateToOperation<TRelation["to"], TRelation["relationship"], "one">
  | SimpleRelateToOperation<TRelation>
  | ReplaceOperation<TRelation["to"], TRelation["relationship"]>;

type RelationUpdateField_Optional<TRelation extends RelationTypeInfo> =
  | RelateToOperation<TRelation["to"], TRelation["relationship"], "one" | "optional">
  | SimpleRelateToOperation<TRelation>
  | ReplaceOperation<TRelation["to"], TRelation["relationship"]>
  | RemoveOperation;

type RelationUpdateField_Many<TRelation extends RelationTypeInfo> =
  | RelateToOperation<TRelation["to"], TRelation["relationship"], "one" | "optional" | "many">
  | SimpleRelateToOperation<TRelation>
  | DisconnectOperation<TRelation["to"]>;
