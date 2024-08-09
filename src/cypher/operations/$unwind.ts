import { unwindClause } from "@core/clause";
import { queryOperation, QueryOperation } from "@core/query-operation";
import { Value } from "@core/value";
import { List } from "@cypher/types/list";
import {
  applyDataMergeString,
  ApplyDataMergeString,
  DataMergeString,
} from "@core/data-merge-string";

export const $unwind = <TMergeString extends DataMergeString, TType extends Value>(
  dataMergeString: TMergeString,
  list: List<TType>,
): QueryOperation<ApplyDataMergeString<TMergeString, TType>, "force-many", "merge"> => {
  return queryOperation({
    name: "$unwind",
    resolver: resolveInfo => {
      const variable = resolveInfo.defineVariable(List.getInnerType(list));
      return {
        clauses: [
          unwindClause({
            list: resolveInfo.resolveValue(list),
            output: variable,
          }),
        ],
        outputShape: applyDataMergeString(dataMergeString, variable),
        cardinalityBehaviour: "force-many",
        dataBehaviour: "merge",
      };
    },
  });
};
