import { castArray } from "@utils/castArray";
import { ValueInfo } from "@core/value-info";
import { callSubqueryClause, CallSubqueryClause, whereClause } from "@core/clause";
import { allVariablesFromDataShape } from "@core/data-shape";
import { Query } from "@core/query";
import { BooleanValue } from "@cypher/types/scalar/boolean";
import { queryOperation, QueryOperation } from "@core/query-operation";
import { Value } from "@core/value";

export type Predicate = BooleanValue<any> | Query<BooleanValue<any>, "one">;
export type Predicates = Predicate | Predicate[];

export const $where = (predicates: Predicates): QueryOperation<void, "<-many", "merge"> => {
  return queryOperation({
    name: "$where",
    resolver: resolveInfo => {
      const resolvedPredicates: ValueInfo[] = [];
      const subqueryClauses: CallSubqueryClause[] = [];

      castArray(predicates).forEach(predicate => {
        if (predicate instanceof Value) {
          resolvedPredicates.push(resolveInfo.resolveValue(predicate));
        } else {
          const { clauses, outputShape } = resolveInfo.resolveSubquery(predicate);
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

      return {
        clauses: [...subqueryClauses, whereClause(resolvedPredicates)],
        outputShape: undefined,
        cardinalityBehaviour: "<-many",
        dataBehaviour: "merge",
      };
    },
  });
};
