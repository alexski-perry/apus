import { Query, queryStage, QueryStage } from "@core";
import { defineVariable$, resolveSubquery$, resolveValue$ } from "@core/resolve-utils";
import { Null } from "@cypher/types/null";
import { expression } from "@cypher/expression/core";
import { callSubqueryClause, returnClause } from "@core/clause";
import { ClauseList } from "@core/clause-list";

export const $effect = (query: Query<any, any>): QueryStage<void, "same", "merge"> => {
  const { clauses } = resolveSubquery$(query, { noReturn: true });
  const ignoredVar = defineVariable$(Null);

  return queryStage({
    clauses: [
      callSubqueryClause(
        ClauseList.update(clauses, [
          returnClause([
            { input: resolveValue$(expression(Null)`count(null)`), output: ignoredVar },
          ]),
        ]),
      ),
    ],
    outputShape: undefined,
    cardinalityBehaviour: "same",
    dataBehaviour: "merge",
  });
};
