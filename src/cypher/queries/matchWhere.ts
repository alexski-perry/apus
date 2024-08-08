import { $where, Predicates } from "@cypher/stages/$where";
import { query_untyped } from "@core/query";
import { $matchNode } from "@cypher/stages/$matchNode";
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
