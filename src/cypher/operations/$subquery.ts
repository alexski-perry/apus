import {
  applyDataMergeString,
  ApplyDataMergeString,
  Identifier,
} from "@core/data-merge-string";
import { callSubqueryClause } from "@core/clause";
import { GetQueryCardinality, GetQueryData, Query } from "@core/query";
import { QueryOperation, queryOperation } from "@core/query-operation";
import { DataShape } from "@core/data-shape";

export function $subquery<TRef extends Identifier, TQuery extends Query>(
  ref: TRef,
  query: TQuery,
): QueryOperation<
  // @ts-expect-error
  ApplyDataMergeString<TRef, GetQueryData<TQuery>>,
  `->${GetQueryCardinality<TQuery>}`,
  "merge"
> {
  return queryOperation({
    name: "$subquery",
    resolver: resolveInfo => {
      const { clauses, outputShape, cardinality } = resolveInfo.resolveSubquery(query);

      return {
        clauses: [callSubqueryClause(clauses)],
        outputShape: applyDataMergeString(ref, outputShape) as DataShape,
        cardinalityBehaviour: `->${cardinality}`,
        dataBehaviour: "merge",
      };
    },
  });
}
