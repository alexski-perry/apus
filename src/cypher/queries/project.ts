import { MatchPattern, Query } from "@core";
import { match, map, mapAndCollect } from "@cypher/queries";
import { Mapping, ParseMapping } from "@cypher/stages/$map";
import { List } from "@cypher/types";
import { GetPatternCardinality, GetPatternData } from "@core/utils";
import { ValueFromQueryData } from "@cypher/types/utils";

export const project = <
  TPattern extends MatchPattern<any, any>,
  TMapping extends Mapping<"1->1">,
>(
  pattern: TPattern,
  mapper: (data: GetPatternData<TPattern>) => TMapping,
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
> = GetPatternCardinality<TPattern> extends "many"
  ? List<ValueFromQueryData<ParseMapping<TMapping>>>
  : ParseMapping<TMapping>;
