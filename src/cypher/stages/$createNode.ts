import { AbstractNodeModel, loadNodeLikeModel, NodeModel } from "@schema/models";
import { applyDataMergeString, mergeIntoQueryStage, QueryStage } from "@core";
import { ApplyDataMergeString, DataMergeString } from "@core/data-merge-string";
import { ConstructorOf } from "@utils/ConstructorOf";
import { Definition } from "@schema/definition";
import { MakeNodeValue } from "@cypher/types";
import { NodeCreateData } from "@cypher/mutation/utils/NodeCreateData";
import { query } from "@cypher/query";
import { $create } from "@cypher/stages/unsafe/$create";
import { creationPattern } from "@cypher/pattern/creation-pattern-builder";
import { $handleMutation } from "@cypher/mutation/utils/$handleMutation";

export const $createNode = <
  TRef extends DataMergeString,
  TNode extends string | ConstructorOf<Definition<"node" | "abstract-node">>,
>(
  ref: TRef,
  node: TNode,
  data: NodeCreateData<TNode>,
): QueryStage<ApplyDataMergeString<TRef, MakeNodeValue<TNode>>, "same", "merge"> => {
  const nodeModel =
    typeof node === "string"
      ? null
      : (loadNodeLikeModel(node) as NodeModel | AbstractNodeModel);

  return mergeIntoQueryStage(
    query()
      .pipe(() => $create(creationPattern().newNode(node, "@")))
      .pipe(node =>
        $handleMutation({
          entityValue: node,
          data,
          entityModel: nodeModel,
          mutationType: "create",
        }),
      )
      .pipe(node => applyDataMergeString(ref, node)),
  );
};
