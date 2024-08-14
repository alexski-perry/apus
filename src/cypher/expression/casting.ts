import { Value } from "@core/value";
import { typeOf, TypeOf } from "@core/type/type";
import { Optional } from "@cypher/types/optional";
import { StringValue } from "@cypher/types/scalar/string";
import { ID } from "@cypher/types/scalar/id";
import { Float } from "@cypher/types/scalar/float";
import { Int, IntValue } from "@cypher/types/scalar/int";

/**
 *  Create a value with a new type but the original ValueData
 */
export function forceType<T extends Value>(value: Value, as: TypeOf<T>): T {
  return Value.create(
    as,
    { ...Value.getValueInfo(value), type: as },
    // Copy over dependencies. Note that if we are creating a copy of a variable, we don't pass
    // in the new variable as a dependency, as we will incorrectly get an 'out of scope' error
    // if we check it, but the old variable will be present and be checked, as we would want
    new Set(Value.getDependencies(value)),
  );
}

export function forceOptional<T extends Value>(
  value: T,
): T extends Optional<any> ? T : Optional<T> {
  if (value instanceof Optional) {
    return value as any;
  } else {
    return forceType(value, Optional.makeType(typeOf(value))) as any;
  }
}

export function forceNotOptional<T extends Value>(
  value: T,
): T extends Optional<infer TInner> ? TInner : T {
  if (value instanceof Optional) {
    return forceType(value, Optional.getInnerType(value)) as any;
  } else {
    return value as any;
  }
}

export function toID(value: StringValue): ID {
  return forceType(value, ID);
}

export function toInt(value: Float | IntValue<any>): Int {
  return forceType(value, Int);
}
