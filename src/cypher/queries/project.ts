import { Mapping, ParseMapping } from "@cypher/operations/$map";
import { GetMatchPatternData } from "@core/pattern/match-pattern";
import {
  forceQueryDataNonOptional,
  forceQueryDataOptional,
  ValueFromQueryData,
} from "@core/query-data";
import { Query, query_untyped } from "@core/query";
import { match, optionalMatch } from "@cypher/queries/match";
import { List } from "@cypher/types/list";
import {
  GetRelationPatternCardinality,
  RelationPattern,
} from "@cypher/pattern/relation-pattern";
import { $collect } from "@cypher/operations/$collect";
import { forceNotOptional } from "@cypher";
import { MakeOptional } from "@cypher/types/optional";

export function project<
  TPattern extends RelationPattern<any, any, any>,
  TMapping extends Mapping<"->one">,
>(
  pattern: TPattern,
  mapF: (data: GetMatchPatternData<TPattern>) => TMapping,
): Query<GetProjectData<TPattern, TMapping>, "one"> {
  const relationModel = RelationPattern.getModel(pattern);

  if (relationModel.cardinality === "one") {
    return query_untyped(match(pattern), data => mapF(data));
  } else if (relationModel.cardinality === "optional") {
    return query_untyped(
      optionalMatch(pattern),
      data => mapF(forceQueryDataNonOptional(data) as any),
      data => forceQueryDataOptional(data) as any,
    );
  } else {
    return query_untyped(
      match(pattern),
      data => mapF(data),
      data => $collect(data),
    );
  }
}

/*
  INTERNAL
 */

type GetProjectData<
  TPattern extends RelationPattern<any, any, any>,
  TMapping extends Mapping<"->one">,
> = GetRelationPatternCardinality<TPattern> extends "many"
  ? List<ValueFromQueryData<ParseMapping<TMapping>>>
  : GetRelationPatternCardinality<TPattern> extends "optional"
    ? MakeOptional<ValueFromQueryData<ParseMapping<TMapping>>>
    : ParseMapping<TMapping>;
