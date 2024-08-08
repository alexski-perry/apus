import {
  GetMatchPatternCardinality,
  GetMatchPatternData,
  MatchPattern,
} from "@core/pattern/match-pattern";
import { Query, query_untyped } from "@core/query";
import { $match, $matchNode, $optionalMatch, $optionalMatchNode } from "neo4j-querier/stages";
import {
  AbstractNodeDefinitionClass,
  NodeDefinitionClass,
  NodeUnionDefinitionClass,
} from "@schema/definition";
import { Node } from "@cypher/types/structural/node";
import { DefinitionFromClass } from "@schema/utils";
import { Value } from "@core/value";

// todo do other queries same as match

export const matchNode = <
  TDef extends
    | string
    | NodeDefinitionClass
    | AbstractNodeDefinitionClass
    | NodeUnionDefinitionClass,
>(
  node: TDef,
): Query<Node<DefinitionFromClass<TDef>>, "many"> => query_untyped(() => $matchNode(node));

export const optionalMatchNode = <
  TDef extends
    | string
    | NodeDefinitionClass
    | AbstractNodeDefinitionClass
    | NodeUnionDefinitionClass,
>(
  node: TDef,
): Query<Node<DefinitionFromClass<TDef>>, "many"> =>
  query_untyped(() => $optionalMatchNode(node));

export const match = <TPattern extends MatchPattern<any, any>>(
  pattern: TPattern,
): Query<GetMatchPatternData<TPattern>, GetMatchPatternCardinality<TPattern>> => {
  let i = 0;
  const input: Record<string, Value> = {};
  const keyMap = new Map<Value, string>();
  const { parts, cardinality, outputShape } = MatchPattern.getData(pattern);

  parts.forEach(part => {
    if (part.value instanceof Value) {
      const key = `key${i++}`;
      input[key] = part.value;
      keyMap.set(part.value, key);
    }
  });

  function makeNewPattern(data: Record<string, Value>): MatchPattern<any, any> {
    return new MatchPattern({
      parts: parts.map(part =>
        part.value instanceof Value
          ? {
              ...part,
              value: data[keyMap.get(part.value)!] as any,
            }
          : part,
      ),
      cardinality,
      outputShape,
    });
  }

  return query_untyped(input, data => $match(makeNewPattern(data)));
};

export const optionalMatch = <TPattern extends MatchPattern<any, any>>(
  pattern: TPattern,
): Query<GetMatchPatternData<TPattern>, GetMatchPatternCardinality<TPattern>> =>
  query_untyped(() => $optionalMatch(pattern));
