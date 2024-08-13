import { createClause } from "@core/clause";
import { CreationPattern } from "@core/pattern/creation-pattern";
import { QueryOperation, queryOperation } from "@core/query-operation";

export const $create = <TPattern extends CreationPattern<any>>(
  pattern: TPattern,
): QueryOperation<
  TPattern extends CreationPattern<infer TData> ? TData : never,
  "->one",
  "merge"
> => {
  return queryOperation({
    name: "$create",
    resolver: resolveInfo => {
      const patternData = CreationPattern.getData(pattern);
      const { dataShape, pattern: clausePattern } =
        resolveInfo.resolveCreationPattern(patternData);

      return {
        clauses: [createClause([clausePattern])],
        outputShape: dataShape,
        cardinalityBehaviour: "->one",
        dataBehaviour: "merge",
      };
    },
  });
};
