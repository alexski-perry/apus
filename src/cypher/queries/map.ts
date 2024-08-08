import { Mapping, ParseMapping } from "../stages/$map";
import { QueryData } from "@core/query-data";
import { QueryCardinality } from "@core/query-cardinality";
import { Query, query_untyped } from "@core/query";

export const map = <
  TDataIn extends QueryData,
  TMapping extends Mapping<"1->1">,
  TCardinality extends QueryCardinality,
>(
  inputQuery: Query<TDataIn, TCardinality>,
  map: (data: TDataIn) => TMapping,
): Query<ParseMapping<TMapping>, TCardinality> => query_untyped(inputQuery, data => map(data));
