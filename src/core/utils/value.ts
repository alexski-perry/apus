import { TypeOf } from "@core/type";
import { Value } from "@core";
import { QueryDataInput } from "@core/utils";

/**
 *  Returns the constructor of a value (fully typed)
 */
export const typeOf = <T extends Value>(value: T): TypeOf<T> => value.constructor as TypeOf<T>;

/**
 *  Recast a value to a new type
 */
export const recastValue = <T extends Value>(value: Value, as: TypeOf<T>): T => {
  return Value.create(as, {
    ...Value.getValueData(value),
    type: as,
  });
};

/**
 *  Helper type to represent a value or the literal value it represents
 */
export type ValueOrInputType<T extends Value> = T | QueryDataInput<T>;
