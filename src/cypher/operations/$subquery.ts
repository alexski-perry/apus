import {
  applyDataMergeString,
  ApplyDataMergeString,
  Identifier,
} from "@core/data-merge-string";
import { callSubqueryClause } from "@core/clause";
import { GetQueryCardinality, GetQueryData, Query } from "@core/query";
import { QueryOperation, queryOperation } from "@core/query-operation";

export const $subquery = <TRef extends Identifier, TQuery extends Query<any, any>>(
  ref: TRef,
  query: TQuery,
): SubqueryOperation<TRef, TQuery> => {
  return queryOperation({
    name: "$subquery",
    resolver: resolveInfo => {
      const { clauses, outputShape, cardinality } = resolveInfo.resolveSubquery(query);

      return {
        clauses: [callSubqueryClause(clauses)],
        outputShape: applyDataMergeString(ref, outputShape),
        cardinalityBehaviour: {
          one: "same" as const,
          "none-or-one": "optional" as const,
          many: "force-many" as const,
        }[cardinality],
        dataBehaviour: "merge",
      };
    },
  });
};

type SubqueryOperation<
  TRef extends Identifier,
  TQuery extends Query<any, any>,
> = QueryOperation<
  ApplyDataMergeString<TRef, GetQueryData<TQuery>>,
  {
    one: "same";
    "none-or-one": "optional";
    many: "force-many";
  }[GetQueryCardinality<TQuery>],
  "merge"
>;
