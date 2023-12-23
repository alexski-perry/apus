import { Property } from "@schema/property";
import { ValueOrInputType } from "@core/utils";

export type PropertyField<T> = T extends Property<infer TProperty>
  ? ValueOrInputType<TProperty["type"]>
  : never;
