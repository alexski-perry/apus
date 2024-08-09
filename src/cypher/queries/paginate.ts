import { $paginate, PaginateData } from "@cypher/operations/$paginate";
import { QueryData } from "@core/query-data";
import { QueryCardinality } from "@core/query-cardinality";
import { Query, query_untyped } from "@core/query";

export const paginate = <TData extends QueryData, TCard extends QueryCardinality>(
  inputQuery: Query<TData, TCard>,
  paginateF: (data: TData) => PaginateData,
): Query<TData, TCard> => query_untyped(inputQuery, data => $paginate(paginateF(data)));
