import { $orderBy, Orderings } from "@cypher/stages/$orderBy";
import { QueryData } from "@core/query-data";
import { Query, query_untyped } from "@core/query";
import { $first } from "@cypher/stages/$first";

export const firstSorted = <TData extends QueryData>(
  inputQuery: Query<TData, "many">,
  sorter: (data: TData) => Orderings,
): Query<TData, "one"> =>
  query_untyped(
    inputQuery,
    data => $orderBy(sorter(data)),
    () => $first(),
  );
