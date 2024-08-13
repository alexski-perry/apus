import { Mapping, ParseMapping } from "@cypher/operations/$map";
import { QueryData } from "@core/query-data";
import { QueryCardinality } from "@core/query-cardinality";
import { Query, query_untyped } from "@core/query";

export function map<
  TDataIn extends QueryData,
  TMapping extends Mapping<"->one">,
  TCardinality extends QueryCardinality,
>(
  inputQuery: Query<TDataIn, TCardinality>,
  map: (data: NoInfer<TDataIn>) => TMapping,
): Query<ParseMapping<TMapping>, TCardinality> {
  return query_untyped(inputQuery, data => map(data));
}
