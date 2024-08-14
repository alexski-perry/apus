import { Value } from "@core/value";
import {
  $map,
  $where,
  forceNotOptional,
  forceType,
  isNotNull,
  isNull,
  nullConst,
  Optional,
  union,
} from "neo4j-querier";
import { Mapping, ParseMapping } from "@cypher/operations/$map";
import { Query, query_untyped } from "@core/query";
import { MakeOptional } from "@cypher/types/optional";
import { ValueFromQueryData } from "@core/query-data";
import { $mapMaybe } from "@cypher/operations/$mapMaybe";

export function mapMaybe<TIn extends Value, TOut extends Mapping<"->one">>(
  value: Optional<TIn>,
  mapF: (val: NoInfer<TIn>) => TOut,
): Query<MakeOptional<ValueFromQueryData<ParseMapping<TOut>>>, "one"> {
  return query_untyped(value, value => $mapMaybe(value, mapF as any));
}
