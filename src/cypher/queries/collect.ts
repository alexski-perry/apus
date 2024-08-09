import { QueryData, ValueFromQueryData } from "@core/query-data";
import { Query, query_untyped } from "@core/query";
import { List } from "@cypher/types/list";
import { $collect } from "@cypher/operations/$collect";

export const collect = <TData extends Exclude<QueryData, void>>(
  inputQuery: Query<TData, any>,
): Query<List<ValueFromQueryData<TData>>, "one"> =>
  query_untyped(inputQuery, data => $collect(data));
