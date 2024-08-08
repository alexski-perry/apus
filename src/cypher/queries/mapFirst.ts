import { Mapping, ParseMapping } from "@cypher/stages/$map";
import { QueryData } from "@core/query-data";
import { Query, query_untyped } from "@core/query";
import { $first } from "@cypher/stages/$first";

export const mapFirst = <TDataIn extends QueryData, TMapping extends Mapping<"1->1">>(
  inputQuery: Query<TDataIn, any>,
  map: (data: TDataIn) => TMapping,
): Query<ParseMapping<TMapping>, "none-or-one"> =>
  query_untyped(
    inputQuery,
    () => $first(),
    data => map(data),
  );
