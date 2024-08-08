import { PropertyDefinition, RelationDefinition } from "@schema/definition";

export type GetUpdateFieldKind<T> = T extends PropertyDefinition<infer TProperty>
  ? TProperty["updateStrategy"] extends "not-allowed" | "autogen"
    ? "none"
    : "prop"
  : T extends RelationDefinition<any>
    ? "relation"
    : "none";
