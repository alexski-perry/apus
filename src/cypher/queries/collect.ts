import { Query, QueryData } from "@core";
import { $collect } from "@cypher/stages";
import { List } from "@cypher/types";
import { ValueFromQueryData } from "@cypher/types/utils";

export const collect = <TData extends Exclude<QueryData, void>>(
  query: Query<TData, any>,
): Query<List<ValueFromQueryData<TData>>, "one"> =>
  query.pipe(data => $collect(data)) as Query<any, any>;
