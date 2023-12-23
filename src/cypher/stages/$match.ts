import { MatchPattern, QueryStage, queryStage } from "@core";
import { resolveMatchPattern$ } from "@core/resolve-utils";
import { matchClause } from "@core/clause";
import { DeepMakeOptional } from "@cypher/types";

export const $match = <TPattern extends MatchPattern<any, any>>(
  pattern: TPattern,
): MatchOperation<TPattern> => createMatchStage(pattern, false);

export const $optionalMatch = <TPattern extends MatchPattern<any, any>>(
  pattern: TPattern,
): OptionalMatchOperation<TPattern> => createMatchStage(pattern, true);

const createMatchStage = (
  pattern: MatchPattern<any, any>,
  isOptional: boolean,
): QueryStage<any, any, any> => {
  const patternData = MatchPattern.getData(pattern);
  const { dataShape, pattern: clausePattern } = resolveMatchPattern$(patternData, isOptional);

  return queryStage({
    clauses: [matchClause([clausePattern], { isOptional })],
    outputShape: dataShape,
    cardinalityBehaviour: {
      one: "same" as const,
      "none-or-one": "optional" as const,
      many: "force-many" as const,
    }[patternData.cardinality],
    dataBehaviour: "merge",
  });
};

/*
  TYPES
 */

type MatchOperation<TPattern extends MatchPattern<any, any>> = QueryStage<
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

type OptionalMatchOperation<TPattern extends MatchPattern<any, any>> = QueryStage<
  TPattern extends MatchPattern<infer TData, any> ? DeepMakeOptional<TData> : never,
  TPattern extends MatchPattern<any, infer TCardinality>
    ? {
        one: "same";
        "none-or-one": "same";
        many: "force-many";
      }[TCardinality]
    : never,
  "merge"
>;
