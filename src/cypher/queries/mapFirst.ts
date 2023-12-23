import { Query, QueryData } from "@core";
import { $first } from "@cypher/stages";
import { Mapping, ParseMapping } from "@cypher/stages/$map";

export const mapFirst = <TDataIn extends QueryData, TMapping extends Mapping<"1->1">>(
  query: Query<TDataIn, any>,
  map: (data: TDataIn) => TMapping,
): Query<ParseMapping<TMapping>, "none-or-one"> =>
  query.pipe(() => $first()).pipe(out => map(out as TDataIn)) as Query<any, any>;
