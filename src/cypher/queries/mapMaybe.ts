import { Value } from "@core/value";
import {
  $map,
  $where,
  forceNotOptional,
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

export function mapMaybe<TIn extends Value, TOut extends Mapping<"->one">>(
  value: Optional<TIn>,
  mapF: (val: NoInfer<TIn>) => TOut,
): Query<MakeOptional<ValueFromQueryData<ParseMapping<TOut>>>, "one"> {
  return query_untyped(value, val =>
    $map(
      union(
        query_untyped(
          val,
          val => $where(isNotNull(val)),
          val => mapF(forceNotOptional(val)),
        ) as Query<any, "one">,
        query_untyped(
          val,
          val => $where(isNull(val)),
          () => nullConst(), // note: logically should be able to omit this (i.e. just return val), but this leads to a wierd Neo4J error (must be a bug): 'Database elements (nodes, relationships, properties) were observed during query execution, but got deleted'
        ) as Query<any, "one">,
      ),
    ),
  );
}
