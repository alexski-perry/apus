import { GetCreateFieldKind } from "@cypher/mutation/utils/GetCreateFieldKind";
import { RelationshipDefinition } from "@schema/definition";

/**
 * Will evaluate to true if the provided relationship doesn't have any required properties
 */
export type IsSimpleRelationship<TRelationship extends RelationshipDefinition> = {
  [K in keyof TRelationship]: GetCreateFieldKind<TRelationship[K]> extends "required-prop"
    ? K
    : never;
}[keyof TRelationship] extends never
  ? true
  : false;
