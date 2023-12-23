import { Query } from "@core/query";
import { $createNode } from "@cypher/stages";
import { Definition } from "@schema/definition";
import { ConstructorOf } from "@utils/ConstructorOf";
import { query } from "@cypher/query";
import { MakeNodeValue } from "@cypher/types";
import { NodeCreateData } from "@cypher/mutation/utils/NodeCreateData";

export const createNode = <
  TNode extends string | ConstructorOf<Definition<"node" | "abstract-node">>,
>(
  node: TNode,
  data: NodeCreateData<TNode>,
): Query<MakeNodeValue<TNode>, "one"> =>
  query().pipe(() => $createNode("@", node, data)) as Query<any, any>;
