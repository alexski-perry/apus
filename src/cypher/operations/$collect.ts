import {collectAgg} from "@cypher/expression/aggregation";
import {withClause} from "@core/clause";
import {expressionFromQueryData} from "@core/expression";
import {typeOf} from "@core/type/type";
import {QueryData, ValueFromQueryData} from "@core/query-data";
import {queryOperation, QueryOperation} from "@core/query-operation";
import {List} from "@cypher/types/list";

export const $collect = <T extends Exclude<QueryData, void>>(
  input: T,
): QueryOperation<List<ValueFromQueryData<T>>, "force-one", "overwrite"> => {
  return queryOperation({
    name: "$collect",
    resolver: resolveInfo => {
      const collectExpression = collectAgg(expressionFromQueryData(input));
      const outputVariable = resolveInfo.defineVariable(typeOf(collectExpression));
      return {
        clauses: [
          withClause([
            {input: resolveInfo.resolveValue(collectExpression), output: outputVariable},
          ]),
        ],
        outputShape: outputVariable,
        cardinalityBehaviour: "force-one",
        dataBehaviour: "overwrite",
      };
    },
  });
};
