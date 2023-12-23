import { castArray } from "@utils/castArray";
import { Query, queryStage, QueryStage, Value } from "@core";
import { Boolean } from "@cypher/types";
import { ValueData } from "@core/value-data";
import { callSubqueryClause, CallSubqueryClause, whereClause } from "@core/clause";
import { resolveSubquery$, resolveValue$ } from "@core/resolve-utils";
import { allVariablesFromDataShape } from "@core/data-shape";

export type Predicate = Boolean | Query<Boolean, "one">;
export type Predicates = Predicate | Predicate[];

export const $where = (predicates: Predicates): QueryStage<void, "same", "merge"> => {
  const resolvedPredicates: ValueData[] = [];
  const subqueryClauses: CallSubqueryClause[] = [];

  castArray(predicates).forEach(predicate => {
    if (predicate instanceof Value) {
      resolvedPredicates.push(resolveValue$(predicate));
    } else {
      const { clauses, outputShape } = resolveSubquery$(predicate);
      const variables = allVariablesFromDataShape(outputShape);

      if (variables.length !== 1) {
        throw new Error(
          "unexpected error: a subquery supplied to $where should have only one output",
        );
      }
      resolvedPredicates.push(variables[0]!);
      subqueryClauses.push(callSubqueryClause(clauses));
    }
  });

  return queryStage({
    clauses: [...subqueryClauses, whereClause(resolvedPredicates)],
    outputShape: undefined,
    cardinalityBehaviour: "same",
    dataBehaviour: "merge",
  });
};
