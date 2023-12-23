import { queryStage, QueryStage } from "@core";
import { Int } from "@cypher/types";
import { limitClause } from "@core/clause";
import { resolveValue$ } from "@core/resolve-utils";
import { expression } from "@cypher/expression/core";

export const $first = (): QueryStage<void, "force-none-or-one", "merge"> =>
  queryStage({
    clauses: [limitClause(resolveValue$(expression(Int)`1`))],
    outputShape: undefined,
    cardinalityBehaviour: "force-one",
    dataBehaviour: "merge",
  });
