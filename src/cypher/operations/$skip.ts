import { queryOperation, QueryOperation } from "@core/query-operation";
import { skipClause } from "@core/clause";
import { Int } from "@cypher/types/scalar/int";

import { parameterize } from "@core/parameterize";

export const $skip = (val: Int | number): QueryOperation<void, "same", "merge"> => {
  return queryOperation({
    name: "$skip",
    resolver: resolveInfo => {
      return {
        clauses: [skipClause(resolveInfo.resolveValue(parameterize(val, Int)))],
        outputShape: undefined,
        cardinalityBehaviour: "same",
        dataBehaviour: "merge",
      };
    },
  });
};
