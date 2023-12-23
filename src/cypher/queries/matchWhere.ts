import { query } from "@cypher/query";
import { $matchNode, $where } from "@cypher/stages";
import { ConstructorOf } from "@utils/ConstructorOf";
import { NodeLikeOrUnionDefinition } from "@schema/definition";
import { MakeNodeValue } from "@cypher/types";
import { Predicates } from "@cypher/stages/$where";

export const matchWhere = <TNode extends string | ConstructorOf<NodeLikeOrUnionDefinition>>(
  node: TNode,
  predicateF: (node: MakeNodeValue<TNode>) => Predicates,
) =>
  query()
    .pipe(() => $matchNode("@", node))
    .pipe(node => $where(predicateF(node as MakeNodeValue<TNode>)));
