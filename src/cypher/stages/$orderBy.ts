import { queryStage, QueryStage, Value } from "@core";
import { ClauseOrdering, orderByClause } from "@core/clause";
import { resolveValue$ } from "@core/resolve-utils";

export type Order = "ASC" | "DESC";
export type Orderings = Value | [Value, Order] | Array<Value | [Value, Order]>;

export const $orderBy = (orderings: Orderings): QueryStage<void, "same", "merge"> => {
  const normalizedOrderings: Array<ClauseOrdering> = [];

  if (Array.isArray(orderings)) {
    if (orderings.length === 2 && (orderings[1] === "ASC" || orderings[1] === "DESC")) {
      normalizedOrderings.push({
        expression: resolveValue$(orderings[0] as Value),
        direction: orderings[1],
      });
    } else {
      normalizedOrderings.push(
        ...orderings.map(order => ({
          expression: resolveValue$(Array.isArray(order) ? order[0] : (order as Value)),
          direction: Array.isArray(order) ? order[1] : "ASC",
        })),
      );
    }
  } else {
    normalizedOrderings.push({
      expression: resolveValue$(orderings),
      direction: "ASC",
    });
  }

  return queryStage({
    outputShape: undefined,
    clauses: [orderByClause(normalizedOrderings)],
    cardinalityBehaviour: "same",
    dataBehaviour: "merge",
  });
};
