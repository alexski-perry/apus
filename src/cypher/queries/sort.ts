import { $orderBy, Orderings } from "@cypher/stages/$orderBy";
import { QueryData } from "@core/query-data";
import { QueryCardinality } from "@core/query-cardinality";
import { Query, query_untyped } from "@core/query";

export const sort = <TData extends QueryData, TCard extends QueryCardinality>(
  inputQuery: Query<TData, TCard>,
  sortF: (data: TData) => Orderings,
): Query<TData, TCard> => query_untyped(inputQuery, data => $orderBy(sortF(data)));
