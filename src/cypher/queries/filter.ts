import { Query, Cardinality, QueryData } from "@core";
import { $where } from "@cypher/stages";
import { Predicates } from "@cypher/stages/$where";

export const filter = <TData extends QueryData, TCard extends Cardinality>(
  query: Query<TData, TCard>,
  filterF: (data: TData) => Predicates,
): Query<TData, TCard> => query.pipe(out => $where(filterF(out))) as Query<any, any>;
