import { FlatNarrow } from "@utils/FlatNarrow";
import { Clause, returnClause, unionSubqueryClause } from "@core/clause";
import { expressionFromQueryData } from "@core/expression";
import { isValueInfo } from "@core/value-info";
import { applyDataMergeString, DataMergeString } from "@core/data-merge-string";
import { GetQueryData, Query, query_untyped } from "@core/query";
import { Union } from "@cypher/types/union";
import { QueryOperation, queryOperation } from "@core/query-operation";

export const $unionSubquery = <TRef extends DataMergeString, T extends Array<Query<any, any>>>(
  ref: TRef,
  queries: FlatNarrow<T>,
): QueryOperation<
  {
    [I in keyof T]: GetQueryData<T[I]>;
  }[number],
  "!many", // todo more precise cardinality?
  "merge"
> => {
  return queryOperation({
    name: "$unionSubquery",
    resolver: resolveInfo => {
      const outputVariable = resolveInfo.defineVariable(Union);
      const subqueries: Array<Array<Clause>> = [];

      queries.forEach(baseQuery => {
        const augmentedQuery = query_untyped(baseQuery, row => expressionFromQueryData(row));
        const { clauses, outputShape } = resolveInfo.resolveSubquery(augmentedQuery, {
          noReturn: true,
        });

        if (!isValueInfo(outputShape)) throw new Error("unexpected output shape");

        subqueries.push([
          ...clauses,
          returnClause([
            {
              input: outputShape,
              output: outputVariable,
            },
          ]),
        ]);
      });

      return {
        clauses: [unionSubqueryClause(subqueries)],
        outputShape: applyDataMergeString(ref, outputVariable),
        cardinalityBehaviour: "!many",
        dataBehaviour: "merge",
      };
    },
  });
};
