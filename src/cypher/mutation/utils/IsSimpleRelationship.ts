import { RelationshipDefinition } from "@schema/definition";
import { GetCreateFieldKind } from "@cypher/mutation/utils/GetCreateFieldKind";

export type IsSimpleRelationship<TRelationship extends RelationshipDefinition> = {
  [K in keyof TRelationship]: GetCreateFieldKind<TRelationship[K]> extends "required-prop"
    ? K
    : never;
}[keyof TRelationship] extends never
  ? true
  : false;
