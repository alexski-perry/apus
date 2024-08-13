import {
  applyDataMergeString,
  ApplyDataMergeString,
  DataMergeString,
} from "@core/data-merge-string";
import { NodeCreateData } from "@cypher/mutation/utils/NodeCreateData";
import { queryOperation, QueryOperation } from "@core/query-operation";
import { NodeDefinitionClass } from "@schema/definition";
import { Node, NodeValue } from "@cypher/types/structural/node";
import { DefinitionFromClass, getNodeLabelsForCreating, maybeLoadModel } from "@schema/utils";
import { createClause } from "@core/clause";
import { handleMutation } from "@cypher/mutation/utils/handleMutation";

export const $createNode = <
  TDef extends string | NodeDefinitionClass,
  TRef extends DataMergeString = "@",
>(
  definition: TDef,
  data: NodeCreateData<DefinitionFromClass<TDef>>,
  // @ts-expect-error
  ref: TRef = "@",
): QueryOperation<
  ApplyDataMergeString<TRef, Node<DefinitionFromClass<TDef>>>,
  "->one",
  "merge"
> => {
  return queryOperation({
    name: "$createNode",
    resolver: resolveInfo => {
      const model = maybeLoadModel(definition);
      const createdNodeVariable = resolveInfo.defineVariable(NodeValue.makeType(definition));

      const mutationClauses = handleMutation({
        targetVariable: createdNodeVariable,
        entityModel: model,
        data,
        mutationType: "create",
        resolveInfo,
      });

      return {
        outputShape: applyDataMergeString(ref, createdNodeVariable),
        clauses: [
          createClause([
            [
              {
                entityType: "node",
                nodeLabels: getNodeLabelsForCreating(definition),
                variable: createdNodeVariable,
              },
            ],
          ]),
          ...mutationClauses,
        ],
        cardinalityBehaviour: "->one",
        dataBehaviour: "merge",
      };
    },
  });
};
