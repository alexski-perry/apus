import { queryOperation, QueryOperation } from "@core/query-operation";
import { deleteClause } from "@core/clause";
import { Optional } from "@cypher/types/optional";
import { Node } from "@cypher/types/structural/node";
import { Relationship } from "@cypher/types/structural/relationship";

export const $delete = (
  relationship: Node | Relationship | Optional<Node | Relationship>,
): QueryOperation<void, "same", "merge"> => {
  return queryOperation({
    name: "$delete",
    resolver: resolveInfo => {
      const valueData = resolveInfo.resolveVariable(
        relationship,
        "$deleteRelationship expects variable",
      );
      return {
        clauses: [deleteClause(valueData)],
        outputShape: undefined,
        cardinalityBehaviour: "same",
        dataBehaviour: "merge",
      };
    },
  });
};
