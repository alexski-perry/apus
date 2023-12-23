import { Query, Cardinality, QueryData } from "@core";
import { Mapping, ParseMapping } from "../stages/$map";

export const map = <
  TDataIn extends QueryData,
  TMapping extends Mapping<"1->1">,
  TCard extends Cardinality,
>(
  query: Query<TDataIn, TCard>,
  map: (data: TDataIn) => TMapping,
): Query<ParseMapping<TMapping>, TCard> => query.pipe(out => map(out)) as Query<any, any>;
