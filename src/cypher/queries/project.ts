import { Mapping, ParseMapping } from "@cypher/stages/$map";
import {
  GetMatchPatternCardinality,
  GetMatchPatternData,
  MatchPattern,
} from "@core/pattern/match-pattern";
import { ValueFromQueryData } from "@core/query-data";
import { Query } from "@core/query";
import { mapAndCollect } from "@cypher/queries/mapAndCollect";
import { match } from "@cypher/queries/match";
import { map } from "@cypher/queries/map";
import { List } from "@cypher/types/list";

export const project = <
  TPattern extends MatchPattern<any, any>,
  TMapping extends Mapping<"1->1">,
>(
  pattern: TPattern,
  mapper: (data: GetMatchPatternData<TPattern>) => TMapping,
): Query<GetProjectData<TPattern, TMapping>, "one"> => {
  const { cardinality } = MatchPattern.getData(pattern);

  if (cardinality === "many") {
    return mapAndCollect(match(pattern), mapper) as Query<any, any>;
  } else {
    return map(match(pattern), mapper) as Query<any, any>;
  }
};

type GetProjectData<
  TPattern extends MatchPattern<any, any>,
  TMapping extends Mapping<"1->1">,
> = GetMatchPatternCardinality<TPattern> extends "many"
  ? List<ValueFromQueryData<ParseMapping<TMapping>>>
  : ParseMapping<TMapping>;
