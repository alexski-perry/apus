import { Query, QueryData } from "@core";
import { $first } from "@cypher/stages";

export const first = <TData extends QueryData>(
  query: Query<TData, any>,
): Query<TData, "one"> => query.pipe(() => $first()) as Query<any, any>;
