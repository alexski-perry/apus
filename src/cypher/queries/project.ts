import { Mapping, ParseMapping } from "@cypher/operations/$map";
import { GetMatchPatternData } from "@core/pattern/match-pattern";
import { forceQueryDataNonOptional, ValueFromQueryData } from "@core/query-data";
import { Query, query_untyped } from "@core/query";
import { match, optionalMatch } from "@cypher/queries/match";
import { List } from "@cypher/types/list";
import {
  GetRelationPatternCardinality,
  RelationPattern,
} from "@cypher/pattern/relation-pattern";
import { $collect } from "@cypher/operations/$collect";
import { forceNotOptional } from "@cypher";

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
      data => forceNotOptional(data),
    );
  } else {
    return query_untyped(
      match(pattern),
      data => mapF(data),
      data => $collect(data),
    );
  }
}

type GetProjectData<
  TPattern extends RelationPattern<any, any, any>,
  TMapping extends Mapping<"->one">,
> = GetRelationPatternCardinality<TPattern> extends "many"
  ? List<ValueFromQueryData<ParseMapping<TMapping>>>
  : ParseMapping<TMapping>;
