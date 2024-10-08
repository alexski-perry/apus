import { $where, Predicates } from "@cypher/operations/$where";
import { QueryData } from "@core/query-data";
import { QueryCardinality } from "@core/query-cardinality";
import { Query, query_untyped } from "@core/query";

export const filter = <TData extends QueryData, TCard extends QueryCardinality>(
  prev: Query<TData, TCard>,
  filterF: (data: TData) => Predicates,
): Query<TData, TCard> => query_untyped(prev, data => $where(filterF(data)));
