import { ApplyDataMergeString, QueryStage, DataMergeString } from "@core";
import { MakeNodeValue, Optional } from "@cypher/types";
import { ConstructorOf } from "@utils/ConstructorOf";
import { NodeLikeOrUnionDefinition } from "@schema/definition";
import { $match, $optionalMatch } from "@cypher/stages/$match";
import { pattern } from "@cypher/pattern/match-pattern-builder";

export const $matchNode = <
  TRef extends DataMergeString,
  TNode extends string | ConstructorOf<NodeLikeOrUnionDefinition>,
>(
  ref: TRef,
  node: TNode,
): QueryStage<ApplyDataMergeString<TRef, MakeNodeValue<TNode>>, "force-many", "merge"> =>
  $match(pattern().newNode(node, ref));

export const $optionalMatchNode = <
  TRef extends DataMergeString,
  TNode extends string | ConstructorOf<NodeLikeOrUnionDefinition>,
>(
  ref: TRef,
  node: TNode,
): QueryStage<
  ApplyDataMergeString<TRef, Optional<MakeNodeValue<TNode>>>,
  "force-many",
  "merge"
  // @ts-expect-error
> => $optionalMatch(pattern().newNode(node, ref));
