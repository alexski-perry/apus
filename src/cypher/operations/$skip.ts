import { queryOperation, QueryOperation } from "@core/query-operation";
import { skipClause } from "@core/clause";
import { Int } from "@cypher/types/scalar/int";

import { makeParam } from "@core/makeParam";

export const $skip = (val: Int | number): QueryOperation<void, "<-many", "merge"> => {
  return queryOperation({
    name: "$skip",
    resolver: resolveInfo => {
      return {
        clauses: [skipClause(resolveInfo.resolveValue(makeParam(val, Int)))],
        outputShape: undefined,
        cardinalityBehaviour: "<-many",
        dataBehaviour: "merge",
      };
    },
  });
};
