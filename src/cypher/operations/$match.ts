import { matchClause } from "@core/clause";
import { GetMatchPatternData, MatchPattern } from "@core/pattern/match-pattern";
import { queryOperation, QueryOperation } from "@core/query-operation";
import { MakeQueryDataOptional } from "@core/query-data";

export function $match<TPattern extends MatchPattern>(
  pattern: TPattern,
): QueryOperation<GetMatchPatternData<TPattern>, "->many", "merge"> {
  return createMatchStage(pattern, false, "$match");
}

export function $optionalMatch<TPattern extends MatchPattern>(
  pattern: TPattern,
): QueryOperation<
  MakeQueryDataOptional<GetMatchPatternData<TPattern>>,
  "->one-or-more",
  "merge"
> {
  return createMatchStage(pattern, true, "$optionalMatch");
}

/*
  INTERNAL
 */

function createMatchStage(
  pattern: MatchPattern,
  isOptional: boolean,
  name: string,
): QueryOperation<any, any, any> {
  const matchPatternData = MatchPattern.getData(pattern);

  return queryOperation({
    name,
    resolver: resolveInfo => {
      const { dataShape, pattern: patternForClause } = resolveInfo.resolveMatchPattern(
        matchPatternData,
        isOptional,
      );

      return {
        clauses: [matchClause([patternForClause], { isOptional })],
        outputShape: dataShape,
        cardinalityBehaviour: isOptional ? "->one-or-more" : "->many",
        dataBehaviour: "merge",
      };
    },
  });
}
