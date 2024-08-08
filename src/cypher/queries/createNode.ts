import { Query, query_untyped } from "@core/query";
import { NodeCreateData } from "@cypher/mutation/utils/NodeCreateData";
import { $createNode } from "neo4j-querier/Stages";
import { NodeDefinitionClass } from "@schema/definition";
import { DefinitionFromClass } from "@schema/utils";
import { Node } from "@cypher/types/structural/node";

export const createNode = <TNode extends string | NodeDefinitionClass>(
  node: TNode,
  data: NodeCreateData<DefinitionFromClass<TNode>>,
): Query<Node<DefinitionFromClass<TNode>>, "one"> =>
  query_untyped(() => $createNode(node, data));
