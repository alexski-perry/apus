import { Node } from "@cypher/types/structural/node";
import { Optional } from "@cypher/types/optional";
import { Query } from "@core/query";
import { FilterDefinition } from "@schema/utils";

export type RelationInput = Node | Optional<Node> | Query<Node | Optional<Node>, any>;

export type GetNodeDefinitionFromRelationInput<T extends RelationInput> = T extends Node<
  infer TDef
>
  ? FilterDefinition<TDef>
  : T extends Optional<Node<infer TDef>>
    ? FilterDefinition<TDef>
    : T extends Query<infer TData extends Exclude<RelationInput, Query<any, any>>, any>
      ? GetNodeDefinitionFromRelationInput<TData>
      : never;
