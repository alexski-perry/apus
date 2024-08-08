import { PropertyValue } from "@cypher/types/property";
import { RelationOperation } from "@cypher/mutation/operations/RelationOperation";
import { Query } from "@core/query";
import { Id } from "@utils/Id";
import { GetUpdateFieldKind } from "@cypher/mutation/utils/GetUpdateFieldKind";
import { PropertyField } from "@cypher/mutation/utils/PropertyField";
import { RelateToOperation } from "@cypher/mutation/operations/relate-to";
import { NodeOrConcreteSubtypes } from "@schema/utils";
import { ReplaceOperation } from "@cypher/mutation/operations/replace";
import { DisconnectOperation } from "@cypher/mutation/operations/disconnect";
import { IsSimpleRelationship } from "@cypher/mutation/utils/IsSimpleRelationship";
import { ReplaceOrRemoveOperation } from "@cypher/mutation/operations/replace-or-remove";
import { DisconnectAllOperation } from "@cypher/mutation/operations/disconnect-all";

import {
  AbstractNodeDefinition,
  NodeDefinition,
  NodeUnionDefinition,
  RelationDefinition,
  RelationTypeInfo,
} from "@schema/definition";
import { RemoveOperation } from "@cypher/mutation/operations/remove";

export type NodeUpdateData<
  T extends string | NodeDefinition | AbstractNodeDefinition | NodeUnionDefinition,
> = T extends NodeDefinition | AbstractNodeDefinition | NodeUnionDefinition
  ? TypedNodeUpdateData<T>
  : UntypedNodeUpdateData;

type UntypedNodeUpdateData = {
  [key: string]: PropertyValue | RelationOperation | Query<PropertyValue, any>;
};

type TypedNodeUpdateData<
  T extends NodeDefinition | AbstractNodeDefinition | NodeUnionDefinition,
> = Id<
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

type RelationUpdateField<T> = T extends RelationDefinition<infer TRelation>
  ? TRelation["cardinality"] extends "one"
    ? RelationUpdateField_One<TRelation>
    : TRelation["cardinality"] extends "optional"
      ? RelationUpdateField_Optional<TRelation>
      : TRelation["cardinality"] extends "many"
        ? RelationUpdateField_Many<TRelation> | Array<RelationUpdateField_Many<TRelation>>
        : never
  : never;

type RelationUpdateField_One<TRelation extends RelationTypeInfo> =
  | RelateToOperation<
      NodeOrConcreteSubtypes<TRelation["to"]>,
      TRelation["relationship"],
      "one"
    >
  | ReplaceOperation<NodeOrConcreteSubtypes<TRelation["to"]>, TRelation["relationship"], "one">
  | (IsSimpleRelationship<TRelation["relationship"]> extends true
      ?
          | RelateToOperation<NodeOrConcreteSubtypes<TRelation["to"]>, null, "one">
          | ReplaceOperation<NodeOrConcreteSubtypes<TRelation["to"]>, null, "one">
      : never);

type RelationUpdateField_Optional<TRelation extends RelationTypeInfo> =
  | RelateToOperation<
      NodeOrConcreteSubtypes<TRelation["to"]>,
      TRelation["relationship"],
      "one" | "optional"
    >
  | ReplaceOperation<NodeOrConcreteSubtypes<TRelation["to"]>, TRelation["relationship"], "one">
  | RemoveOperation
  | ReplaceOrRemoveOperation<
      NodeOrConcreteSubtypes<TRelation["to"]>,
      TRelation["relationship"]
    >
  | (IsSimpleRelationship<TRelation["relationship"]> extends true
      ?
          | RelateToOperation<
              NodeOrConcreteSubtypes<TRelation["to"]>,
              null,
              "one" | "optional"
            >
          | ReplaceOperation<NodeOrConcreteSubtypes<TRelation["to"]>, null, "one">
          | ReplaceOrRemoveOperation<NodeOrConcreteSubtypes<TRelation["to"]>, null>
      : never);

type RelationUpdateField_Many<TRelation extends RelationTypeInfo> =
  | RelateToOperation<
      NodeOrConcreteSubtypes<TRelation["to"]>,
      TRelation["relationship"],
      "one" | "optional" | "many"
    >
  | DisconnectOperation<NodeOrConcreteSubtypes<TRelation["to"]>>
  | DisconnectAllOperation
  | (IsSimpleRelationship<TRelation["relationship"]> extends true
      ? RelateToOperation<
          NodeOrConcreteSubtypes<TRelation["to"]>,
          null,
          "one" | "optional" | "many"
        >
      : never);
