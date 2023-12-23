import { getVariablesFromPattern, MatchPattern, Query } from "@core";
import { $match, $matchNode, $optionalMatch, $optionalMatchNode } from "@cypher/stages";
import { query, subquery } from "../query";
import { GetPatternCardinality, GetPatternData } from "@core/utils";
import { MakeNodeValue } from "@cypher/types/utils";
import { ConstructorOf } from "@utils/ConstructorOf";
import { NodeLikeOrUnionDefinition } from "@schema/definition";

export const matchNode = <TNode extends string | ConstructorOf<NodeLikeOrUnionDefinition>>(
  node: TNode,
): Query<MakeNodeValue<TNode>, "many"> =>
  query().pipe(() => $matchNode("@", node)) as Query<any, any>;

export const optionalMatchNode = <
  TNode extends string | ConstructorOf<NodeLikeOrUnionDefinition>,
>(
  node: TNode,
): Query<MakeNodeValue<TNode>, "many"> =>
  query().pipe(() => $optionalMatchNode("@", node)) as Query<any, any>;

export const match = <TPattern extends MatchPattern<any, any>>(
  pattern: TPattern,
): Query<GetPatternData<TPattern>, GetPatternCardinality<TPattern>> =>
  subquery(getVariablesFromPattern(pattern)).pipe(() => $match(pattern)) as Query<any, any>;

export const optionalMatch = <TPattern extends MatchPattern<any, any>>(
  pattern: TPattern,
): Query<GetPatternData<TPattern>, GetPatternCardinality<TPattern>> =>
  query().pipe(() => $optionalMatch(pattern)) as Query<any, any>;
