import { Type, TypeOf } from "@core/type/type";
import { F } from "ts-toolbelt";
import { Value, ValueOrInputType } from "@core/value";
import { Any } from "@cypher/types/any";

export function parameterize(value: ValueOrInputType<any>): Any;
export function parameterize<T extends Value>(
  value: F.NoInfer<ValueOrInputType<T>>,
  type: TypeOf<T>,
): T;
export function parameterize(value: any, type?: Type): Value {
  return value instanceof Value
    ? value
    : Value.create(type ?? Any, { kind: "parameter", type: type ?? Any, value: value });
}
