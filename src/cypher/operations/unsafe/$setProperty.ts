import { queryOperation, QueryOperation } from "@core/query-operation";
import { setPropertyClause } from "@core/clause";
import { Value } from "@core/value";
import { Node } from "@cypher/types/structural/node";
import { Relationship } from "@cypher/types/structural/relationship";

export const $setProperty = (
  entity: Node | Relationship,
  propertyName: string,
  value: Value,
): QueryOperation<void, "->one", "merge"> => {
  return queryOperation({
    name: "$setProperty",
    resolver: resolveInfo => {
      return {
        clauses: [
          setPropertyClause({
            entity: resolveInfo.resolveVariable(
              entity,
              "$setProperty entity must be a variable",
            ),
            propertyName,
            value: resolveInfo.resolveValue(value),
          }),
        ],
        outputShape: undefined,
        cardinalityBehaviour: "->one",
        dataBehaviour: "merge",
      };
    },
  });
};
