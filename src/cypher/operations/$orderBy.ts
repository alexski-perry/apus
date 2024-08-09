import { queryOperation, QueryOperation } from "@core/query-operation";
import { ClauseOrdering, orderByClause } from "@core/clause";
import { Value } from "@core/value";

export type Order = "ASC" | "DESC";
export type Orderings = Value | [Value, Order] | Array<Value | [Value, Order]>;

export const $orderBy = (orderings: Orderings): QueryOperation<void, "same", "merge"> => {
  return queryOperation({
    name: "$orderBy",
    resolver: resolveInfo => {
      const normalizedOrderings: Array<ClauseOrdering> = [];

      if (Array.isArray(orderings)) {
        if (orderings.length === 2 && (orderings[1] === "ASC" || orderings[1] === "DESC")) {
          normalizedOrderings.push({
            expression: resolveInfo.resolveValue(orderings[0] as Value),
            direction: orderings[1],
          });
        } else {
          normalizedOrderings.push(
            ...orderings.map(order => ({
              expression: resolveInfo.resolveValue(
                Array.isArray(order) ? order[0] : (order as Value),
              ),
              direction: Array.isArray(order) ? order[1] : "ASC",
            })),
          );
        }
      } else {
        normalizedOrderings.push({
          expression: resolveInfo.resolveValue(orderings),
          direction: "ASC",
        });
      }

      return {
        outputShape: undefined,
        clauses: [orderByClause(normalizedOrderings)],
        cardinalityBehaviour: "same",
        dataBehaviour: "merge",
      };
    },
  });
};
