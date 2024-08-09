import { propUnsafe } from "@cypher/expression/prop";
import { findAll } from "@cypher/queries/findAll";
import { $where } from "@cypher/operations/$where";
import { inList } from "@cypher/expression/operators";
import {
  AbstractNodeDefinitionClass,
  NodeDefinitionClass,
  NodeUnionDefinitionClass,
} from "@schema/definition";
import { query } from "@core/query";

export const findAllByIDs = <
  TDef extends
    | string
    | NodeDefinitionClass
    | AbstractNodeDefinitionClass
    | NodeUnionDefinitionClass,
>(
  node: TDef,
  ids: string[],
) => query(findAll(node), node => $where(inList(propUnsafe(node, "id"), ids)));
