import { createClause } from "@core/clause";
import { CreationPattern } from "@core/pattern/creation-pattern";
import { QueryOperation, queryOperation } from "@core/query-operation";

export const $create = <TPattern extends CreationPattern<any>>(
  pattern: TPattern,
): CreateOperation<TPattern> => {
  return queryOperation({
    name: "$create",
    resolver: resolveInfo => {
      const patternData = CreationPattern.getData(pattern);
      const { dataShape, pattern: clausePattern } =
        resolveInfo.resolveCreationPattern(patternData);

      return {
        clauses: [createClause([clausePattern])],
        outputShape: dataShape,
        cardinalityBehaviour: "same",
        dataBehaviour: "merge",
      };
    },
  });
};

type CreateOperation<TPattern extends CreationPattern<any>> = QueryOperation<
  TPattern extends CreationPattern<infer TData> ? TData : never,
  "same",
  "merge"
>;
