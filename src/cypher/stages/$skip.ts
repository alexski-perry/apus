import { Int } from "../types";
import { queryStage, QueryStage } from "@core/query-stage";
import { resolveValue$ } from "@core/resolve-utils";
import { parameterize } from "@cypher/expression/param";
import { skipClause } from "@core/clause";

export const $skip = (val: Int | number): QueryStage<void, "same", "merge"> =>
  queryStage({
    outputShape: undefined,
    clauses: [skipClause(resolveValue$(parameterize(val, Int)))],
    cardinalityBehaviour: "same",
    dataBehaviour: "merge",
  });
