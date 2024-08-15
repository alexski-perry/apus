import { queryOperation, QueryOperation } from "@core/query-operation";
import { limitClause } from "@core/clause";
import { Int } from "@cypher/types/scalar/int";
import { makeParam } from "@core/makeParam";

export const $limit = (val: Int | number): QueryOperation<void, "<-many", "merge"> => {
  return queryOperation({
    name: "$limit",
    resolver: resolveInfo => {
      return {
        clauses: [limitClause(resolveInfo.resolveValue(makeParam(val, Int)))],
        outputShape: undefined,
        cardinalityBehaviour: "<-many",
        dataBehaviour: "merge",
      };
    },
  });
};
