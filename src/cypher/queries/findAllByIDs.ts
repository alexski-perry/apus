import { $where } from "@cypher/stages";
import { anyProp, inList } from "cypher/expression";
import { findAll } from "@cypher/queries";
import { ID } from "@cypher/types";
import { ConstructorOf } from "@utils/ConstructorOf";
import { NodeLikeOrUnionDefinition } from "@schema/definition";

export const findAllByIDs = <TNode extends string | ConstructorOf<NodeLikeOrUnionDefinition>>(
  node: TNode,
  ids: string[],
) => findAll(node).pipe(node => $where(inList(anyProp(node, "id", ID), ids)));
