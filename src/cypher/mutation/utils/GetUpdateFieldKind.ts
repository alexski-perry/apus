import { Property } from "@schema/property";
import { Relation } from "@schema/relation";

export type GetUpdateFieldKind<T> = T extends Property<infer TProperty>
  ? TProperty["updateStrategy"] extends "not-allowed" | "autogen"
    ? "none"
    : "prop"
  : T extends Relation<any>
  ? "relation"
  : "none";
