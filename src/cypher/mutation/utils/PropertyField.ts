import { ValueOrInputType } from "@core/value";
import { PropertyDefinition } from "@schema/definition";

export type PropertyField<T> = T extends PropertyDefinition<infer TProperty>
  ? ValueOrInputType<TProperty["type"]>
  : never;
