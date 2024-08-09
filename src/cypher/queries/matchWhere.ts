import { $where, Predicates } from "@cypher/operations/$where";
import { query_untyped } from "@core/query";
import { $matchNode } from "@cypher/operations/$matchNode";
import {
  AbstractNodeDefinitionClass,
  NodeDefinitionClass,
  NodeUnionDefinitionClass,
} from "@schema/definition";
import { DefinitionFromClass } from "@schema/utils";
import { Node } from "@cypher/types/structural/node";

export const matchWhere = <
  TNode extends
    | string
    | NodeDefinitionClass
    | AbstractNodeDefinitionClass
    | NodeUnionDefinitionClass,
>(
  node: TNode,
  predicateF: (node: Node<DefinitionFromClass<TNode>>) => Predicates,
) =>
  query_untyped(
    () => $matchNode(node),
    node => $where(predicateF(node as Node<DefinitionFromClass<TNode>>)),
  );
