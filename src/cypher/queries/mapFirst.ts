import { Mapping, ParseMapping } from "@cypher/operations/$map";
import { QueryData } from "@core/query-data";
import { Query, query_untyped } from "@core/query";
import { $first } from "@cypher/operations/$first";

export function mapFirst<TDataIn extends QueryData, TMapping extends Mapping<"->one">>(
  inputQuery: Query<TDataIn, any>,
  map: (data: TDataIn) => TMapping,
): Query<ParseMapping<TMapping>, "none-or-one"> {
  return query_untyped(
    inputQuery,
    () => $first(),
    data => map(data),
  );
}
