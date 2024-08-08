import { $where, Predicates } from "@cypher/stages/$where";
import { QueryData } from "@core/query-data";
import { Query, query_untyped } from "@core/query";
import { $first } from "@cypher/stages/$first";

export const firstFiltered = <TData extends QueryData>(
  inputQuery: Query<TData, any>,
  filter: (data: TData) => Predicates,
): Query<TData, "one"> =>
  query_untyped(
    inputQuery,
    data => $where(filter(data)),
    () => $first(),
  );
