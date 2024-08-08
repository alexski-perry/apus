import { queryOperation, QueryOperation } from "@core/query-operation";
import { limitClause } from "@core/clause";
import { Int } from "@cypher/types/scalar/int";
import { parameterize } from "@core/parameterize";

export const $limit = (val: Int | number): QueryOperation<void, "same", "merge"> => {
  return queryOperation({
    name: "$limit",
    resolver: resolveInfo => {
      return {
        clauses: [limitClause(resolveInfo.resolveValue(parameterize(val, Int)))],
        outputShape: undefined,
        cardinalityBehaviour: "same",
        dataBehaviour: "merge",
      };
    },
  });
};
