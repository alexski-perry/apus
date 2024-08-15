import { expression } from "@core/expression";
import { Node, NodeValue } from "@cypher/types/structural/node";
import { loadModel } from "@schema/loadModel";
import { Any } from "@cypher/types/any";
import { String } from "@cypher/types/scalar/string";
import { and, hasLabel, isNotNull } from "@cypher/expression/operators";
import { propUnsafe } from "@cypher/expression/prop";
import {
  AbstractNodeModel,
  AbstractRelationshipModel,
  getDefinitionClass,
  NodeModel,
  NodeUnionModel,
  RelationshipModel,
} from "@schema/model";
import {
  getNodeLabelsForMatching,
  getModelDebugName,
  getRelationshipName,
} from "@schema/utils";
import { makeParam } from "@core/makeParam";
import { queryOperation, QueryOperation } from "@core/query-operation";
import {
  callProcedureClause,
  callSubqueryClause,
  CallSubqueryClause,
  Clause,
  deleteClause,
  importWithClause,
  matchClause,
  resetCardinalityReturnClause,
  whereClause,
} from "@core/clause";
import { Variable } from "@core/value-info";
import { Value } from "@core/value";
import { QueryOperationResolveInfo } from "@build/QueryOperationResolveInfo";
import { RelationshipValue } from "@cypher/types/structural/relationship";

export const $deleteNode = (node: Node): QueryOperation<undefined, "->one", "merge"> => {
  const definition = NodeValue.getDefinition(node);

  if (typeof definition === "string") throw new Error("untyped $deleteNode not yet supported");

  return queryOperation({
    name: "$deleteNode",
    resolver: resolveInfo => {
      const toDeleteVariable = resolveInfo.resolveVariable(node);
      const deleteClauses = handleDelete({
        toDeleteVariable,
        resolveInfo,
        model: loadModel(definition),
      });

      return {
        clauses: deleteClauses,
        outputShape: undefined,
        cardinalityBehaviour: "->one",
        dataBehaviour: "merge",
      };
    },
  });
};

function handleDelete(params: {
  toDeleteVariable: Variable;
  model:
    | NodeModel
    | AbstractNodeModel
    | NodeUnionModel
    | RelationshipModel
    | AbstractRelationshipModel;
  resolveInfo: QueryOperationResolveInfo;
}): Clause[] {
  const { toDeleteVariable, model, resolveInfo } = params;

  const effectClauses: CallSubqueryClause[] = [];

  function recursivelyAddSubtypeEffects(
    subtypeModel: NodeModel | AbstractNodeModel,
    parentKeys: Set<string>,
  ) {
    const { clause, coveredKeys } = getSubtypeQuery({
      toDeleteVariable,
      resolveInfo,
      subtypeModel,
      ignoreKeys: parentKeys,
    });
    effectClauses.push(clause);

    subtypeModel.subtypes.forEach(subtypeSubtypeModel => {
      recursivelyAddSubtypeEffects(
        subtypeSubtypeModel,
        new Set([...parentKeys, ...coveredKeys]),
      );
    });
  }

  if (model.kind === "NodeUnion") {
    model.subtypes.forEach(subtypeModel =>
      recursivelyAddSubtypeEffects(subtypeModel, new Set()),
    );
  } else if (model.kind === "Node" || model.kind === "AbstractNode") {
    recursivelyAddSubtypeEffects(model, new Set());
  }

  return [...effectClauses, deleteClause(toDeleteVariable)];
}

function getSubtypeQuery(params: {
  toDeleteVariable: Variable;
  resolveInfo: QueryOperationResolveInfo;
  subtypeModel: NodeModel | AbstractNodeModel;
  ignoreKeys: Set<string>;
}): { clause: CallSubqueryClause; coveredKeys: Array<string> } {
  const { toDeleteVariable, resolveInfo, subtypeModel, ignoreKeys } = params;

  const subqueryClauses: Clause[] = [];
  const coveredKeys: Array<string> = [];

  subqueryClauses.push(
    importWithClause([toDeleteVariable]),
    whereClause([
      Value.getValueInfo(
        and(
          ...getNodeLabelsForMatching(subtypeModel).map(label =>
            hasLabel(Value.createRaw(toDeleteVariable) as any, label),
          ),
        ),
      ),
    ]),
  );

  Object.values(subtypeModel.relations).forEach(relationModel => {
    if (ignoreKeys.has(relationModel.key)) return; // already covered by supertype
    coveredKeys.push(relationModel.key);

    const relationshipVariable = resolveInfo.defineVariable(
      RelationshipValue.makeType(getDefinitionClass(relationModel.relationship)),
    );

    const connectedNodeVariable = resolveInfo.defineVariable(
      NodeValue.makeType(getDefinitionClass(relationModel.to)),
    );

    const effectClauses: Clause[] = [
      matchClause([
        [
          {
            entityType: "node",
            variable: toDeleteVariable,
            nodeLabels: [],
          },
          {
            entityType: "relationship",
            variable: relationshipVariable,
            relationshipNames: getRelationshipName(relationModel.relationship),
            direction: relationModel.direction,
          },
          {
            entityType: "node",
            variable: connectedNodeVariable,
            nodeLabels: getNodeLabelsForMatching(relationModel.to),
          },
        ],
      ]),
    ];

    if (relationModel.deletionStrategy === "no-delete") {
      effectClauses.push(
        callProcedureClause({
          name: "apoc.util.validate",
          args: [
            Value.getValueInfo(isNotNull(Value.createRaw(relationshipVariable))),
            Value.getValueInfo(
              makeParam(
                `Can't delete '${getModelDebugName(
                  subtypeModel,
                )}' with ID '%s' because one or more '${relationModel.key}' relations exist`,
                String,
              ),
            ),
            Value.getValueInfo(
              expression(Any)`[${propUnsafe(Value.createRaw(toDeleteVariable) as any, "id")}]`,
            ),
          ],
          yields: [],
        }),
      );
    }

    if (relationModel.deletionStrategy === "disconnect") {
      effectClauses.push(
        ...handleDelete({
          toDeleteVariable: relationshipVariable,
          resolveInfo,
          model: relationModel.relationship,
        }),
      );
    }

    if (relationModel.deletionStrategy === "cascade") {
      throw new Error("cascading not supported yet"); // todo decide whether to support
    }

    subqueryClauses.push(
      callSubqueryClause([
        importWithClause([toDeleteVariable]),
        ...effectClauses,
        resetCardinalityReturnClause(resolveInfo.defineVariable(Any)),
      ]),
    );
  });

  return {
    clause: callSubqueryClause([
      ...subqueryClauses,
      resetCardinalityReturnClause(resolveInfo.defineVariable(Any)),
    ]),
    coveredKeys,
  };
}
