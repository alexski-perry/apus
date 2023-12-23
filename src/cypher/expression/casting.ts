import { Value } from "@core";
import { ConstructorOf } from "@utils/ConstructorOf";
import { recastValue } from "@core/utils";
import { Optional } from "@cypher/types";

export const castAsOptional = <T extends Value>(
  value: T,
): T extends Optional<any> ? T : Optional<T> =>
  recastValue(value, Optional.of(value.constructor as ConstructorOf<Value>)) as any;

export const castNonNull = <T extends Value>(
  value: T,
): T extends Optional<infer TInner> ? TInner : T => {
  if (value instanceof Optional) {
    const inner = Optional.getInnerType(value);

    // todo support by adding Map type (will also be needed for list indexing operation)
    if (typeof inner !== "function")
      throw new Error("assertNonNull not currently sorted on 'object' optionals");

    return recastValue(value, inner) as any;
  } else {
    return value as any;
  }
};
