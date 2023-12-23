import { Query, QueryData } from "@core";
import { $first, $orderBy } from "@cypher/stages";
import { Orderings } from "@cypher/stages/$orderBy";

export const firstSorted = <TData extends QueryData>(
  query: Query<TData, "many">,
  sorter: (data: TData) => Orderings,
): Query<TData, "one"> =>
  query.pipe(out => $orderBy(sorter(out))).pipe(() => $first()) as Query<any, any>;
