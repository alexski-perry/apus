import { Mapping, ParseMapping } from "../stages/$map";
import { QueryData, ValueFromQueryData } from "@core/query-data";
import { Query, query_untyped } from "@core/query";
import { List } from "@cypher/types/list";
import { $collect } from "@cypher/stages/$collect";

export const mapAndCollect = <TDataIn extends QueryData, TMapping extends Mapping<"1->1">>(
  inputQuery: Query<TDataIn, any>,
  map: (data: TDataIn) => TMapping,
): Query<List<ValueFromQueryData<ParseMapping<TMapping>>>, "one"> =>
  query_untyped(
    inputQuery,
    data => map(data),
    data => $collect(data),
  );
