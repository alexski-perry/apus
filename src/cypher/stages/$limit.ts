import { Int } from "../types";
import { queryStage, QueryStage } from "@core/query-stage";
import { parameterize } from "@cypher/expression/param";
import { resolveValue$ } from "@core/resolve-utils";
import { limitClause } from "@core/clause";

export const $limit = (val: Int | number): QueryStage<void, "same", "merge"> =>
  queryStage({
    clauses: [limitClause(resolveValue$(parameterize(val, Int)))],
    outputShape: undefined,
    cardinalityBehaviour: "same",
    dataBehaviour: "merge",
  });
