import { Value } from "@core";
import { TypeOf } from "@core/type";
import { QueryDataInput } from "@core/utils";
import { AllowedPropertyValue } from "@cypher/types";
import { F } from "ts-toolbelt";

export const parameterize = <T extends AllowedPropertyValue>(
  value: F.NoInfer<T | QueryDataInput<T>>,
  type: TypeOf<T>,
): T =>
  (value instanceof Value
    ? value
    : Value.create(type, { kind: "parameter", type, value: value })) as T;
