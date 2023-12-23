export type DefinitionKind =
  | "node"
  | "node-union"
  | "node-interface"
  | "abstract-node"
  | "relationship";

// this is needed because the type (for example)
//   `NodeDefinition | NodeInterfaceDefinition | AbstractNodeDefinition`
// doesn't work as expected
export interface Definition<TKind extends DefinitionKind> {
  $kind: TKind;
}

export type NodeLikeDefinition = Definition<"node" | "abstract-node" | "node-interface">;

export type NodeLikeOrUnionDefinition = Definition<
  "node" | "abstract-node" | "node-interface" | "node-union"
>;

export type RelationshipDefinition = Definition<"relationship">;
export type NodeDefinition = Definition<"node">;
export type NodeUnionDefinition = Definition<"node-union">;
