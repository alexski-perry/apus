import { ExtractNodeDefinition, Node, NodeValue } from "@cypher/types/structural/node";
import { queryOperation, QueryOperation } from "@core/query-operation";
import { NodeUpdateData } from "@cypher/mutation/utils/NodeUpdateData";
import { maybeLoadModel } from "@schema/utils";
import { AbstractNodeDefinition, NodeDefinition } from "@schema/definition";
import { handleMutation } from "@cypher/mutation/utils/handleMutation";
import { Value } from "@core/value";
import { isVariable } from "@core/value-info";

export const $updateNode = <
  TNode extends Node<string | NodeDefinition | AbstractNodeDefinition>,
>(
  node: TNode,
  data: NodeUpdateData<ExtractNodeDefinition<TNode>>,
): QueryOperation<void, "same", "merge"> => {
  return queryOperation({
    name: "$updateNode",
    resolver: resolveInfo => {
      const definition = NodeValue.getDefinition(node);
      const model = maybeLoadModel(definition);

      if (model?.kind === "NodeUnion") throw new Error("Can't use $updateNode on node union");

      const variable = resolveInfo.resolveVariable(node, "$updateNode expected variable");

      const mutationClauses = handleMutation({
        targetVariable: variable,
        entityModel: model,
        data,
        mutationType: "update",
        resolveInfo,
      });

      return {
        outputShape: undefined,
        clauses: mutationClauses,
        cardinalityBehaviour: "same",
        dataBehaviour: "merge",
      };
    },
  });

  // return queryOperationFromQuery(
  //   "$updateNode",
  //   query(() =>
  //     $effect(
  //       handleMutation({
  //         entityModel,
  //         entityValue: node,
  //         data,
  //         mutationType: "update",
  //         providedData: {},
  //       }),
  //     ),
  //   ),
  // );
};
