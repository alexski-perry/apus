import { GetQueryCardinality, GetQueryData, Query, Value } from "@core";
import { castNonNull } from "cypher/expression";
import { $throwIfNull } from "@cypher/stages";
import { Optional } from "@cypher/types";
import { query } from "@cypher/query";

export function throwIfNull<T extends Value>(
  value: T,
  message?: string,
): Query<T extends Optional<infer TNullable> ? TNullable : T, "one">;

export function throwIfNull<T extends Query<any, any>>(
  query: T,
  message?: string,
): Query<
  GetQueryData<T> extends Optional<infer TNullable> ? TNullable : GetQueryData<T>,
  GetQueryCardinality<T>
>;

export function throwIfNull(
  input: Value | Query<any, any>,
  message?: string,
): Query<any, any> {
  const baseQuery: Query<Value, any> =
    input instanceof Value ? query().pipe(() => input) : input;
  return baseQuery.pipe(row => $throwIfNull(row, message)).pipe(row => castNonNull(row));
}
