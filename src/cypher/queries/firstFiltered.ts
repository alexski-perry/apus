import { Query, QueryData } from "@core";
import { $first, $where } from "@cypher/stages";
import { Predicates } from "@cypher/stages/$where";

export const firstFiltered = <TData extends QueryData>(
  query: Query<TData, any>,
  filter: (data: TData) => Predicates,
): Query<TData, "one"> =>
  query.pipe(out => $where(filter(out))).pipe(() => $first()) as Query<any, any>;
