import { queryStage, QueryStage } from "@core/query-stage";
import { resolveValue$, resolveVariable$ } from "@core/resolve-utils";
import { setPropertyClause } from "@core/clause";
import { NodeUnionValue, NodeValue, RelationshipValue } from "@cypher/types";
import { Value } from "@core";

export const $setProperty = (
  entity: NodeValue | NodeUnionValue | RelationshipValue,
  propertyName: string,
  value: Value,
): QueryStage<void, "same", "merge"> =>
  queryStage({
    clauses: [
      setPropertyClause({
        entity: resolveVariable$(entity, "$setProperty entity must be a variable"),
        propertyName,
        value: resolveValue$(value),
      }),
    ],
    outputShape: undefined,
    cardinalityBehaviour: "same",
    dataBehaviour: "merge",
  });
