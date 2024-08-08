import { $match, $optionalMatch } from "@cypher/stages/$match";
import { pattern } from "@cypher/pattern/match-pattern-builder";
import { Optional } from "@cypher/types/optional";
import { ApplyDataMergeString, DataMergeString } from "@core/data-merge-string";
import { QueryOperation } from "@core/query-operation";
import {
  AbstractNodeDefinitionClass,
  NodeDefinitionClass,
  NodeUnionDefinitionClass,
} from "@schema/definition";
import { Node } from "@cypher/types/structural/node";
import { DefinitionFromClass } from "@schema/utils";

export const $matchNode = <
  TDef extends
    | string
    | NodeDefinitionClass
    | AbstractNodeDefinitionClass
    | NodeUnionDefinitionClass,
  TRef extends DataMergeString = "@",
>(
  node: TDef,
  // @ts-expect-error
  ref: TRef = "@",
): QueryOperation<
  ApplyDataMergeString<TRef, Node<DefinitionFromClass<TDef>>>,
  "force-many",
  "merge"
> => $match(pattern().newNode(node, ref));

export const $optionalMatchNode = <
  TDef extends
    | string
    | NodeDefinitionClass
    | AbstractNodeDefinitionClass
    | NodeUnionDefinitionClass,
  TRef extends DataMergeString = "@",
>(
  node: TDef,
  // @ts-expect-error
  ref: TRef = "@",
): QueryOperation<
  ApplyDataMergeString<TRef, Optional<Node<DefinitionFromClass<TDef>>>>,
  "force-many",
  "merge"
  // @ts-expect-error
> => $optionalMatch(pattern().newNode(node, ref));
