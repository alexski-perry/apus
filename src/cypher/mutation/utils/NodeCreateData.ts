import { ConstructorOf } from "@utils/ConstructorOf";
import { Definition, NodeDefinition } from "@schema/definition";
import { Deconstruct } from "@utils/deconstruct";
import { AllowedPropertyValue, NodeValue } from "@cypher/types";
import { RelateToOperation } from "@cypher/mutation/operations/relate-to";
import { Query } from "@core";
import { Id } from "@utils/Id";
import { GetCreateFieldKind } from "@cypher/mutation/utils/GetCreateFieldKind";
import { PropertyField } from "@cypher/mutation/utils/PropertyField";
import { Relation, RelationCardinality } from "@schema/relation";
import { SimpleRelateToOperation } from "@cypher/mutation/operations/simple-relate-to";

export type NodeCreateData<
  T extends string | ConstructorOf<Definition<"node" | "abstract-node">>,
> = T extends ConstructorOf<NodeDefinition>
  ? TypedNodeCreateData<Deconstruct<T>>
  : UntypedNodeCreateData;

type UntypedNodeCreateData = {
  [key: string]:
    | AllowedPropertyValue
    | RelateToOperation<any, any, any>
    | Query<NodeValue, any>;
};

type TypedNodeCreateData<T extends Definition<"node" | "abstract-node">> = Id<
  {
    [K in keyof T as GetCreateFieldKind<T[K]> extends "required-prop"
      ? K
      : never]-?: PropertyField<T[K]>;
  } & {
    [K in keyof T as GetCreateFieldKind<T[K]> extends "optional-prop"
      ? K
      : never]+?: PropertyField<T[K]>;
  } & {
    [K in keyof T as GetCreateFieldKind<T[K]> extends "required-relation" ? K : never]-?:
      | RelationField<T[K]>
      | "auto";
  } & {
    [K in keyof T as GetCreateFieldKind<T[K]> extends "optional-relation"
      ? K
      : never]+?: RelationField<T[K]>;
  }
>;

type RelationField<T> = T extends Relation<infer TRelation>
  ?
      | RelateToOperation<
          TRelation["to"],
          TRelation["relationship"],
          RelationFieldCardinality<TRelation["cardinality"]>
        >
      | SimpleRelateToOperation<TRelation>
  : never;

type RelationFieldCardinality<TRelationCardinality extends RelationCardinality> =
  TRelationCardinality extends "one"
    ? "one"
    : TRelationCardinality extends "optional"
    ? "one" | "optional"
    : "one" | "optional" | "many";
