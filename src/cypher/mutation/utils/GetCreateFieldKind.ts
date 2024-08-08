import { Optional } from "@cypher/types/optional";
import { PropertyDefinition, RelationDefinition } from "@schema/definition";

export type GetCreateFieldKind<T> = T extends PropertyDefinition<infer TProperty>
  ? TProperty["creationStrategy"] extends "autogen"
    ? "none"
    : TProperty["creationStrategy"] extends "with-default"
      ? "optional-prop"
      : TProperty["type"] extends Optional<any>
        ? "optional-prop"
        : "required-prop"
  : T extends RelationDefinition<infer TRelation>
    ? TRelation["cardinality"] extends "one"
      ? "required-relation"
      : "optional-relation"
    : "none";
