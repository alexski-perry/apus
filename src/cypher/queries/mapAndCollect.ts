import { Mapping, ParseMapping } from "@cypher/operations/$map";
import { QueryData, ValueFromQueryData } from "@core/query-data";
import { Query, query_untyped } from "@core/query";
import { List } from "@cypher/types/list";
import { $collect } from "@cypher/operations/$collect";

export function mapAndCollect<TDataIn extends QueryData, TMapping extends Mapping<"->one">>(
  inputQuery: Query<TDataIn, any>,
  map: (data: NoInfer<TDataIn>) => TMapping,
): Query<List<ValueFromQueryData<ParseMapping<TMapping>>>, "one"> {
  return query_untyped(
    inputQuery,
    data => map(data),
    data => $collect(data),
  );
}
