import { Query, Cardinality, QueryData } from "@core";
import { $orderBy } from "@cypher/stages";
import { Orderings } from "@cypher/stages/$orderBy";

export const sort = <TData extends QueryData, TCard extends Cardinality>(
  query: Query<TData, TCard>,
  sortF: (data: TData) => Orderings,
): Query<TData, TCard> => query.pipe(out => $orderBy(sortF(out))) as Query<any, any>;
