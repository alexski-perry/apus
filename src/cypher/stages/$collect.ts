import { QueryStage, QueryData, queryStage } from "@core";
import { List } from "@cypher/types";
import { collectAgg } from "@cypher/aggregation/collectAgg";
import { defineVariable$, resolveValue$ } from "@core/resolve-utils";
import { typeOf } from "@core/utils";
import { withClause } from "@core/clause";
import { ValueFromQueryData } from "@cypher/types/utils";
import { expressionFromQueryData } from "@cypher/expression/core";

export const $collect = <T extends Exclude<QueryData, void>>(
  input: T,
): QueryStage<List<ValueFromQueryData<T>>, "force-one", "overwrite"> => {
  const collectExpression = collectAgg(expressionFromQueryData(input));
  const outputVariable = defineVariable$(typeOf(collectExpression));

  return queryStage({
    clauses: [
      withClause([{ input: resolveValue$(collectExpression), output: outputVariable }]),
    ],
    outputShape: outputVariable,
    cardinalityBehaviour: "force-one",
    dataBehaviour: "overwrite",
  });
};
