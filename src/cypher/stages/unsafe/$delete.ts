import { queryStage, QueryStage } from "@core";
import { NodeUnionValue, NodeValue, Optional, RelationshipValue } from "@cypher/types";
import { deleteClause } from "@core/clause";
import { resolveVariable$ } from "@core/resolve-utils";

export const $delete = (
  relationship:
    | NodeValue
    | NodeUnionValue
    | RelationshipValue
    | Optional<NodeValue | NodeUnionValue | RelationshipValue>,
): QueryStage<void, "same", "merge"> => {
  const valueData = resolveVariable$(relationship, "$deleteRelationship expects variable");

  return queryStage({
    clauses: [deleteClause(valueData)],
    outputShape: undefined,
    cardinalityBehaviour: "same",
    dataBehaviour: "merge",
  });
};
