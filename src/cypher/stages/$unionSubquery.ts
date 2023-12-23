import {
  applyDataMergeString,
  DataMergeString,
  GetQueryCardinality,
  GetQueryData,
  Query,
  queryStage,
  QueryStage,
  StageCardinalityBehaviour,
} from "@core";
import { FlatNarrow } from "@utils/FlatNarrow";
import { Union } from "@cypher/types";
import { defineVariable$, resolveSubquery$ } from "@core/resolve-utils";
import { returnClause, unionSubqueryClause } from "@core/clause";
import { ClauseList } from "@core/clause-list";
import { expressionFromQueryData } from "@cypher/expression/core";
import { isValueData } from "@core/value-data";

export const $unionSubquery = <TRef extends DataMergeString, T extends Array<Query<any, any>>>(
  ref: TRef,
  queries: FlatNarrow<T>,
): UnionOperation<T> => {
  const outputVariable = defineVariable$(Union);
  const subqueries: Array<ClauseList> = [];

  queries.forEach(query => {
    const augmentedQuery = query.pipe(row => expressionFromQueryData(row));
    const { clauses, outputShape } = resolveSubquery$(augmentedQuery, {
      noReturn: true,
    });

    if (!isValueData(outputShape)) throw new Error("unexpected output shape");

    subqueries.push(
      ClauseList.update(clauses, [
        returnClause([
          {
            input: outputShape,
            output: outputVariable,
          },
        ]),
      ]),
    );
  });

  return queryStage({
    clauses: [unionSubqueryClause(subqueries)],
    outputShape: applyDataMergeString(ref, outputVariable),
    cardinalityBehaviour: "force-many",
    dataBehaviour: "merge",
  });
};

type UnionOperation<T extends Array<Query<any, any>>> = QueryStage<
  {
    [I in keyof T]: GetQueryData<T[I]>;
  }[number],
  "force-many",
  "merge"
>;
