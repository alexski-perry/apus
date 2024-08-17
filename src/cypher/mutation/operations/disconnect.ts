import { RelationOperation } from "@cypher/mutation/operations/RelationOperation";
import {
  GetNodeDefinitionFromRelationInput,
  RelationInput,
} from "@cypher/mutation/utils/RelationInput";
import { Query } from "@core/query";
import { isNotNull } from "@cypher/expression/operators";
import {
  AbstractNodeDefinition,
  NodeDefinition,
  NodeUnionDefinition,
} from "@schema/definition";
import { getDefinitionClass } from "@schema/model";
import {
  callProcedureClause,
  callSubqueryClause,
  Clause,
  deleteClause,
  importWithClause,
  matchClause,
  resetCardinalityReturnClause,
} from "@core/clause";
import { Any } from "@cypher/types/any";
import { isVariable, Variable } from "@core/value-info";
import { getRelationshipName } from "@schema/utils";
import { Value } from "@core/value";
import { RelationshipValue } from "@cypher/types/structural/relationship";
import { makeParam } from "@core/makeParam";
import { an } from "vitest/dist/chunks/reporters.C_zwCd4j";

export const disconnect = <TReplaceWith extends RelationInput>(
  node: TReplaceWith,
): DisconnectOperation<GetNodeDefinitionFromRelationInput<TReplaceWith>> =>
  new DisconnectOperation(node, false);

export const disconnectStrict = <TReplaceWith extends RelationInput>(
  node: TReplaceWith,
): DisconnectOperation<GetNodeDefinitionFromRelationInput<TReplaceWith>> =>
  new DisconnectOperation(node, true);

export class DisconnectOperation<
  TNode extends NodeDefinition | AbstractNodeDefinition | NodeUnionDefinition,
> extends RelationOperation {
  protected _typeInfo: [TNode] = null as any;

  constructor(disconnect: RelationInput, isStrict: boolean) {
    super(({ relationModel, targetVariable, targetModel, resolveInfo }) => {
      const mutationClauses: Clause[] = [];
      let nodeToDisconnectVariable: Variable;

      if (disconnect instanceof Query) {
        const { clauses, outputShape } = resolveInfo.resolveSubquery(disconnect);
        if (!isVariable(outputShape)) {
          throw new Error("disconnect: provided query had unexpected type");
        }

        const additionalImportVariables: Variable[] = [];
        if (clauses[0]?.type === "IMPORT WITH") {
          additionalImportVariables.push(...clauses[0].variables);
          clauses.shift();
        }

        nodeToDisconnectVariable = outputShape;
        mutationClauses.push(
          importWithClause([targetVariable, ...additionalImportVariables]),
          callSubqueryClause([
            importWithClause([targetVariable, ...additionalImportVariables]),
            ...clauses,
          ]),
        );
      } else {
        nodeToDisconnectVariable = resolveInfo.resolveVariable(disconnect);
        mutationClauses.push(importWithClause([targetVariable, nodeToDisconnectVariable]));
      }

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
                variable: nodeToDisconnectVariable,
                nodeLabels: [],
              },
            ],
          ],
          { isOptional: true },
        ),
      );

      if (isStrict) {
        mutationClauses.push(
          callProcedureClause({
            name: "apoc.util.validate",
            args: [
              Value.getValueInfo(
                isNotNull(Value.create(relationshipVariable.type, relationshipVariable)),
              ),
              Value.getValueInfo(
                makeParam("Attempted to disconnect a relationship that wasn't connected"),
              ),
            ],
            yields: [],
          }),
        );
      }

      mutationClauses.push(deleteClause(relationshipVariable));

      return [
        callSubqueryClause([
          ...mutationClauses,
          resetCardinalityReturnClause(resolveInfo.defineVariable(Any)),
        ]),
      ];
    });
  }
}
