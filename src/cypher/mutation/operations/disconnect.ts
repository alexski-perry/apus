import { Definition, NodeDefinition } from "@schema/definition";
import { Boolean, GraphNode, Optional } from "@cypher/types";
import { Query } from "@core/query";
import { RelationOperation } from "@cypher/mutation/core/RelationOperation";

export class DisconnectOperation<
  TNode extends Definition<"node" | "abstract-node" | "node-interface" | "node-union">,
> extends RelationOperation {
  private declare _typeInfo: [TNode];

  constructor() {
    super(({ entityValue, relationModel }) => {
      return [];
    });
  }
}

export declare const disconnect: <TNodeDef extends NodeDefinition>(
  node:
    | GraphNode<TNodeDef>
    | Optional<GraphNode<TNodeDef>>
    | Array<GraphNode<TNodeDef> | Optional<GraphNode<TNodeDef>>>
    | ((node: GraphNode<TNodeDef>) => Boolean | Query<Boolean, "one">),
) => DisconnectOperation<TNodeDef>;

export declare const disconnectAll: () => DisconnectOperation<any>;
