import { Value } from "@core/value";
import { typeOf, TypeOf } from "@core/type/type";
import { Optional } from "@cypher/types/optional";
import { expression } from "@core/expression";

/**
 *  Create a value with a new type but the original ValueData
 */
export const forceType = <T extends Value>(value: Value, as: TypeOf<T>): T => {
  return Value.create(
    as,
    { ...Value.getValueInfo(value), type: as },
    // Copy over dependencies. Note that if we are creating a copy of a variable, we don't pass
    // in the new variable as a dependency, as we will incorrectly get an 'out of scope' error
    // if we check it, but the old variable will be present and be checked, as we would want
    new Set(Value.getDependencies(value)),
  );
};

export const forceOptional = <T extends Value>(
  value: T,
): T extends Optional<any> ? T : Optional<T> => {
  if (value instanceof Optional) {
    return value as any;
  } else {
    return forceType(value, Optional.makeType(typeOf(value))) as any;
  }
};

export const forceNotOptional = <T extends Value>(
  value: T,
): T extends Optional<infer TInner> ? TInner : T => {
  if (value instanceof Optional) {
    return forceType(value, Optional.getInnerType(value)) as any;
  } else {
    return value as any;
  }
};
