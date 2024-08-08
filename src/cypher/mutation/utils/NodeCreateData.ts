import { RelateToOperation } from "@cypher/mutation/operations/relate-to";
import { Query } from "@core/query";
import { Id } from "@utils/Id";
import { GetCreateFieldKind } from "@cypher/mutation/utils/GetCreateFieldKind";
import { PropertyField } from "@cypher/mutation/utils/PropertyField";
import { IsSimpleRelationship } from "@cypher/mutation/utils/IsSimpleRelationship";
import { PropertyValue } from "@cypher/types/property";

import { NodeDefinition, RelationCardinality, RelationDefinition } from "@schema/definition";
import { NodeOrConcreteSubtypes } from "@schema/utils";

export type NodeCreateData<T extends string | NodeDefinition> = T extends NodeDefinition
  ? TypedNodeCreateData<T>
  : UntypedNodeCreateData;

type UntypedNodeCreateData = {
  [key: string]: PropertyValue | RelateToOperation<any, any, any> | Query<PropertyValue, any>;
};

type TypedNodeCreateData<T extends NodeDefinition> = Id<
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
      | RelationCreateField<T[K]>
      | "auto";
  } & {
    [K in keyof T as GetCreateFieldKind<T[K]> extends "optional-relation"
      ? K
      : never]+?: RelationCreateField<T[K]>;
  }
>;

type RelationCreateField<T> = T extends RelationDefinition<infer TRelation>
  ?
      | RelateToOperation<
          NodeOrConcreteSubtypes<TRelation["to"]>,
          TRelation["relationship"],
          RelateToCardinality<TRelation["cardinality"]>
        >
      | (IsSimpleRelationship<TRelation["relationship"]> extends true
          ? RelateToOperation<
              NodeOrConcreteSubtypes<TRelation["to"]>,
              null,
              RelateToCardinality<TRelation["cardinality"]>
            >
          : never)
  : never;

type RelateToCardinality<TRelationCardinality extends RelationCardinality> =
  TRelationCardinality extends "one"
    ? "one"
    : TRelationCardinality extends "optional"
      ? "one" | "optional"
      : "one" | "optional" | "many";