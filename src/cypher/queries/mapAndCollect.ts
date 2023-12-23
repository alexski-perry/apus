import { Query, QueryData } from "@core";
import { List } from "@cypher/types";
import { Mapping, ParseMapping } from "../stages/$map";
import { $collect } from "@cypher/stages";
import { ValueFromQueryData } from "@cypher/types/utils";

export const mapAndCollect = <TDataIn extends QueryData, TMapping extends Mapping<"1->1">>(
  query: Query<TDataIn, any>,
  map: (data: TDataIn) => TMapping,
): Query<List<ValueFromQueryData<ParseMapping<TMapping>>>, "one"> =>
  query.pipe(out => map(out)).pipe(out => $collect(out as any)) as Query<any, any>;
