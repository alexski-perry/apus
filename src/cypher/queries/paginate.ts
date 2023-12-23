import { Query, Cardinality, QueryData } from "@core";
import { $paginate } from "@cypher/stages";
import { PaginateData } from "@cypher/stages/$paginate";

export const paginate = <TData extends QueryData, TCard extends Cardinality>(
  query: Query<TData, TCard>,
  paginateF: (data: TData) => PaginateData,
): Query<TData, TCard> => query.pipe(out => $paginate(paginateF(out))) as Query<any, any>;
