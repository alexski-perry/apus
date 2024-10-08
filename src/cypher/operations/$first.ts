import { queryOperation, QueryOperation } from "@core/query-operation";
import { limitClause } from "@core/clause";
import { expression } from "@core/expression";
import { Int } from "@cypher/types/scalar/int";

export const $first = (): QueryOperation<void, "<-one", "merge"> => {
  return queryOperation({
    name: "$first",
    resolver: resolveInfo => {
      return {
        clauses: [limitClause(resolveInfo.resolveValue(expression(Int)`1`))],
        outputShape: undefined,
        cardinalityBehaviour: "<-one",
        dataBehaviour: "merge",
      };
    },
  });
};
