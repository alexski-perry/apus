import { QueryData } from "@core/query-data";
import { Query, query_untyped } from "@core/query";
import { $first } from "@cypher/operations/$first";

export const first = <TData extends QueryData>(
  inputQuery: Query<TData, any>,
): Query<TData, "one"> => query_untyped(inputQuery, () => $first());
