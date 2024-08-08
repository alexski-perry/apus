import { matchClause } from "@core/clause";
import { MatchPattern } from "@core/pattern/match-pattern";
import { queryOperation, QueryOperation } from "@core/query-operation";

import { MakeQueryDataOptional } from "@core/query-data";

export const $match = <TPattern extends MatchPattern<any, any>>(
  pattern: TPattern,
): MatchOperation<TPattern> => createMatchStage(pattern, false, "$match");

export const $optionalMatch = <TPattern extends MatchPattern<any, any>>(
  pattern: TPattern,
): OptionalMatchOperation<TPattern> => createMatchStage(pattern, true, "$optionalMatch");

const createMatchStage = (
  pattern: MatchPattern<any, any>,
  isOptional: boolean,
  name: string,
): QueryOperation<any, any, any> => {
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
        cardinalityBehaviour: {
          one: "same" as const,
          "none-or-one": "optional" as const,
          many: "force-many" as const,
        }[matchPatternData.cardinality],
        dataBehaviour: "merge",
      };
    },
  });
};

/*
  TYPES
 */

type MatchOperation<TPattern extends MatchPattern<any, any>> = QueryOperation<
  TPattern extends MatchPattern<infer TData, any> ? TData : never,
  TPattern extends MatchPattern<any, infer TCardinality>
    ? {
        one: "same";
        "none-or-one": "optional";
        many: "force-many";
      }[TCardinality]
    : never,
  "merge"
>;

type OptionalMatchOperation<TPattern extends MatchPattern<any, any>> = QueryOperation<
  TPattern extends MatchPattern<infer TData, any> ? MakeQueryDataOptional<TData> : never,
  TPattern extends MatchPattern<any, infer TCardinality>
    ? {
        one: "same";
        "none-or-one": "same";
        many: "force-many";
      }[TCardinality]
    : never,
  "merge"
>;
