import { Optional } from "@cypher/types/optional";
import {
  applyDataMergeString,
  ApplyDataMergeString,
  DataMergeString,
} from "@core/data-merge-string";
import { queryOperation, QueryOperation } from "@core/query-operation";
import {
  AbstractNodeDefinitionClass,
  NodeDefinitionClass,
  NodeUnionDefinitionClass,
} from "@schema/definition";
import { Node, NodeValue } from "@cypher/types/structural/node";
import { DefinitionFromClass, getNodeLabelsForMatching } from "@schema/utils";
import { matchClause } from "@core/clause";

export function $matchNode<
  TDef extends
    | string
    | NodeDefinitionClass
    | AbstractNodeDefinitionClass
    | NodeUnionDefinitionClass,
  TRef extends DataMergeString = "@",
>(
  node: TDef,
  // @ts-expect-error
  ref: TRef = "@",
): QueryOperation<
  ApplyDataMergeString<TRef, Node<DefinitionFromClass<TDef>>>,
  "->many",
  "merge"
> {
  return createMatchNodeStage(node, ref, false, "$matchNode");
}

export const $optionalMatchNode = <
  TDef extends
    | string
    | NodeDefinitionClass
    | AbstractNodeDefinitionClass
    | NodeUnionDefinitionClass,
  TRef extends DataMergeString = "@",
>(
  node: TDef,
  // @ts-expect-error
  ref: TRef = "@",
): QueryOperation<
  ApplyDataMergeString<TRef, Optional<Node<DefinitionFromClass<TDef>>>>,
  "->one-or-more",
  "merge"
> => {
  return createMatchNodeStage(node, ref, true, "$optionalMatchNode");
};

/*
  INTERNAL
 */

function createMatchNodeStage(
  definition:
    | string
    | NodeDefinitionClass
    | AbstractNodeDefinitionClass
    | NodeUnionDefinitionClass,
  ref: DataMergeString,
  isOptional: boolean,
  name: string,
): QueryOperation<any, any, any> {
  return queryOperation({
    name,
    resolver: resolveInfo => {
      const variable = resolveInfo.defineVariable(
        isOptional
          ? Optional.makeType(NodeValue.makeType(definition))
          : NodeValue.makeType(definition),
      );

      return {
        clauses: [
          matchClause(
            [
              [
                {
                  entityType: "node",
                  variable,
                  nodeLabels: getNodeLabelsForMatching(definition),
                },
              ],
            ],
            { isOptional },
          ),
        ],
        outputShape: applyDataMergeString(ref, variable),
        cardinalityBehaviour: isOptional ? "->one-or-more" : "->many",
        dataBehaviour: "merge",
      };
    },
  });
}
