import { Definition, RelationshipDefinition } from "@schema/definition";
import { GraphNode, NodeValue, Optional } from "@cypher/types";
import { Query, Value } from "@core";
import { RelationOperation } from "@cypher/mutation/core/RelationOperation";
import { CreatedRelationship } from "@cypher/mutation/core/CreatedRelationship";

export class ReplaceOperation<
  TNode extends Definition<"node" | "abstract-node" | "node-interface" | "node-union">,
  TRelationship extends Definition<"relationship"> | null,
> extends RelationOperation {
  private declare _typeInfo: [TNode, TRelationship];

  constructor(
    private _data: {
      node: Value | Query<any, any>;
      relationship: ((node: NodeValue) => CreatedRelationship<any>) | null;
    },
  ) {
    super(() => []); // todo
  }

  static getData(op: ReplaceOperation<any, any>) {
    return op._data;
  }
}

type NodeInput =
  | NodeValue
  | Optional<NodeValue>
  | Query<NodeValue | Optional<NodeValue>, "one">;

type GetNodeDef<T extends NodeInput> = T extends Optional<GraphNode<infer TNode>>
  ? TNode
  : T extends GraphNode<infer TNode>
  ? TNode
  : T extends Query<infer TData, any>
  ? TData extends GraphNode<infer TNode>
    ? TNode
    : TData extends Optional<GraphNode<infer TNode>>
    ? TNode
    : never
  : never;

export const replace = <
  TNodeInput extends NodeInput,
  TRelationshipInput extends
    | ((node: GraphNode<GetNodeDef<TNodeInput>>) => CreatedRelationship<any>)
    | null = null,
>(
  node: TNodeInput,
  relationship?: TRelationshipInput,
): ReplaceOperation<
  GetNodeDef<TNodeInput>,
  TRelationshipInput extends Function
    ? ReturnType<TRelationshipInput> extends CreatedRelationship<
        infer TRelationshipDef extends RelationshipDefinition
      >
      ? TRelationshipDef
      : never
    : null
> =>
  new ReplaceOperation<any, any>({
    node,
    relationship: relationship ?? null,
  } as any);
