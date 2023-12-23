import { Property } from "@schema/property";
import { Optional } from "@cypher/types";
import { Relation } from "@schema/relation";

export type GetCreateFieldKind<T> = T extends Property<infer TProperty>
  ? TProperty["creationStrategy"] extends "autogen"
    ? "none"
    : TProperty["creationStrategy"] extends "with-default"
    ? "optional-prop"
    : TProperty["type"] extends Optional<any>
    ? "optional-prop"
    : "required-prop"
  : T extends Relation<infer TRelation>
  ? TRelation["cardinality"] extends "one"
    ? "required-relation"
    : "optional-relation"
  : "none";
