import { forceNotOptional, forceOptional, Optional } from "neo4j-querier";
import { Value } from "@core/value";

export function maybe<TIn extends Value, TOut extends Value>(
  optional: Optional<TIn>,
  map: (val: TIn) => TOut,
): TOut extends Optional<any> ? TOut : Optional<TOut> {
  return forceOptional(map(forceNotOptional(optional)));
}
