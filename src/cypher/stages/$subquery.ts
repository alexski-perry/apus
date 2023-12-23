import { GetQueryCardinality, GetQueryData, Query, queryStage, QueryStage } from "@core";
import {
  applyDataMergeString,
  ApplyDataMergeString,
  Identifier,
} from "@core/data-merge-string";
import { resolveSubquery$ } from "@core/resolve-utils";
import { callSubqueryClause } from "@core/clause";

export const $subquery = <TRef extends Identifier, TQuery extends Query<any, any>>(
  ref: TRef,
  query: TQuery,
): SubqueryOperation<TRef, TQuery> => {
  const { clauses, outputShape, cardinality } = resolveSubquery$(query);

  return queryStage({
    clauses: [callSubqueryClause(clauses)],
    outputShape: applyDataMergeString(ref, outputShape),
    cardinalityBehaviour: {
      one: "same" as const,
      "none-or-one": "optional" as const,
      many: "force-many" as const,
    }[cardinality],
    dataBehaviour: "merge",
  });
};

type SubqueryOperation<TRef extends Identifier, TQuery extends Query<any, any>> = QueryStage<
  ApplyDataMergeString<TRef, GetQueryData<TQuery>>,
  {
    one: "same";
    "none-or-one": "optional";
    many: "force-many";
  }[GetQueryCardinality<TQuery>],
  "merge"
>;
