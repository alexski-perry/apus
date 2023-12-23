import { IsSimpleRelationship } from "@cypher/mutation/utils/IsSimpleRelationship";
import { RelationCardinality, RelationTypeInfo } from "@schema/relation";
import { RelateToOperation } from "@cypher/mutation/operations/relate-to";

/**
 * A utility type to represent a relate to operation that doesn't need the relationship to be
 * manually created (only if allowed: i.e. has no required properties... otherwise becomes 'never')
 */
export type SimpleRelateToOperation<TRelationInfo extends RelationTypeInfo> =
  IsSimpleRelationship<TRelationInfo["relationship"]> extends true
    ? RelateToOperation<
        TRelationInfo["to"],
        null,
        SimpleRelateToCardinality<TRelationInfo["cardinality"]>
      >
    : never;

type SimpleRelateToCardinality<TRelationCardinality extends RelationCardinality> =
  TRelationCardinality extends "one"
    ? "one"
    : TRelationCardinality extends "optional"
    ? "one" | "optional"
    : "one" | "optional" | "many";
