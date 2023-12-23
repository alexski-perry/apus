import { queryStage, QueryStage } from "@core";
import { Int } from "@cypher/types";
import { parameterize } from "@cypher/expression/param";
import { Clause, limitClause, skipClause } from "@core/clause";
import { resolveValue$ } from "@core/resolve-utils";

export type PaginateData = {
  limit?: number | Int;
  skip?: number | Int;
};

export const $paginate = (config: PaginateData): QueryStage<void, "same", "merge"> => {
  const clauses: Clause[] = [];

  if (config.limit) {
    clauses.push(limitClause(resolveValue$(parameterize(config.limit, Int))));
  }

  if (config.skip) {
    clauses.push(skipClause(resolveValue$(parameterize(config.skip, Int))));
  }

  return queryStage({
    clauses,
    outputShape: undefined,
    cardinalityBehaviour: "same",
    dataBehaviour: "merge",
  });
};
