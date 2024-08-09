import { $orderBy, Orderings } from "@cypher/operations/$orderBy";
import { QueryData } from "@core/query-data";
import { Query, query_untyped } from "@core/query";
import { $first } from "@cypher/operations/$first";

export const firstSorted = <TData extends QueryData>(
  inputQuery: Query<TData, "many">,
  sorter: (data: TData) => Orderings,
): Query<TData, "one"> =>
  query_untyped(
    inputQuery,
    data => $orderBy(sorter(data)),
    () => $first(),
  );
