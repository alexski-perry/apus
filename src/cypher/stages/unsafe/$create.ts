import { CreationPattern, QueryStage, queryStage } from "@core";
import { resolveCreationPattern$ } from "@core/resolve-utils";
import { createClause } from "@core/clause";

export const $create = <TPattern extends CreationPattern<any>>(
  pattern: TPattern,
): CreateOperation<TPattern> => {
  const patternData = CreationPattern.getData(pattern);
  const { dataShape, pattern: clausePattern } = resolveCreationPattern$(patternData);

  return queryStage({
    clauses: [createClause([clausePattern])],
    outputShape: dataShape,
    cardinalityBehaviour: "same",
    dataBehaviour: "merge",
  });
};

/*
  TYPES
 */

type CreateOperation<TPattern extends CreationPattern<any>> = QueryStage<
  TPattern extends CreationPattern<infer TData> ? TData : never,
  "same",
  "merge"
>;
