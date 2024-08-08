import { RelationOperation } from "@cypher/mutation/operations/RelationOperation";
import { getDefinitionClass } from "@schema/model";
import {
  callSubqueryClause,
  Clause,
  deleteClause,
  matchClause,
  resetCardinalityReturnClause,
} from "@core/clause";
import { Any } from "@cypher/types/any";
import { RelationshipValue } from "@cypher/types/structural/relationship";
import { getNodeLabelsForMatching, getRelationshipName } from "@schema/utils";

export class DisconnectAllOperation extends RelationOperation {
  protected _typeInfo: ["DisconnectAllOperation"] = null as any;

  constructor() {
    super(({ relationModel, targetVariable, resolveInfo }) => {
      const mutationClauses: Clause[] = [];

      const relationshipVariable = resolveInfo.defineVariable(
        RelationshipValue.makeType(getDefinitionClass(relationModel.relationship)),
      );

      mutationClauses.push(
        matchClause(
          [
            [
              {
                entityType: "node",
                variable: targetVariable,
                nodeLabels: [],
              },
              {
                entityType: "relationship",
                direction: relationModel.direction,
                variable: relationshipVariable,
                relationshipNames: getRelationshipName(relationModel.relationship),
              },
              {
                entityType: "node",
                variable: null,
                nodeLabels: getNodeLabelsForMatching(relationModel.to),
              },
            ],
          ],
          { isOptional: true },
        ),
        deleteClause(relationshipVariable),
      );

      return [
        callSubqueryClause([
          ...mutationClauses,
          resetCardinalityReturnClause(resolveInfo.defineVariable(Any)),
        ]),
      ];
    });
  }
}

export const disconnectAll = () => new DisconnectAllOperation();
