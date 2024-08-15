import { queryOperation, QueryOperation } from "@core/query-operation";
import { Clause, limitClause, skipClause } from "@core/clause";
import { Int } from "@cypher/types/scalar/int";

import { makeParam } from "@core/makeParam";

export type PaginateData = {
  limit?: number | Int;
  skip?: number | Int;
};

export const $paginate = (config: PaginateData): QueryOperation<void, "<-many", "merge"> => {
  return queryOperation({
    name: "$paginate",
    resolver: resolveInfo => {
      const clauses: Clause[] = [];

      if (config.limit) {
        clauses.push(limitClause(resolveInfo.resolveValue(makeParam(config.limit, Int))));
      }

      if (config.skip) {
        clauses.push(skipClause(resolveInfo.resolveValue(makeParam(config.skip, Int))));
      }

      return {
        clauses,
        outputShape: undefined,
        cardinalityBehaviour: "<-many",
        dataBehaviour: "merge",
      };
    },
  });
};
