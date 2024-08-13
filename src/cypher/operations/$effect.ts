import { Null } from "@cypher/types/null";
import { expression } from "@core/expression";
import { callSubqueryClause, returnClause } from "@core/clause";
import { Query } from "@core/query";
import { queryOperation, QueryOperation } from "@core/query-operation";
import { Value } from "@core/value";

export const $effect = (query: Query<any, any>): QueryOperation<void, "->one", "merge"> => {
  return queryOperation({
    name: "$effect",
    resolver: resolveInfo => {
      const { clauses } = resolveInfo.resolveSubquery(query);

      // ignore 'empty' effects
      if (clauses.length === 0) {
        return {
          clauses: [],
          outputShape: undefined,
          cardinalityBehaviour: "->one",
          dataBehaviour: "merge",
        };
      }

      return {
        clauses: [
          callSubqueryClause([
            ...clauses,
            returnClause([
              {
                input: Value.getValueInfo(expression(Null)`count(null)`),
                output: resolveInfo.defineVariable(Null),
              },
            ]),
          ]),
        ],
        outputShape: undefined,
        cardinalityBehaviour: "->one",
        dataBehaviour: "merge",
      };
    },
  });
};
