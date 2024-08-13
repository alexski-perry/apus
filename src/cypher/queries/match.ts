import { GetMatchPatternData, MatchPattern } from "@core/pattern/match-pattern";
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
import { MakeQueryDataOptional } from "@core/query-data";
import { Float } from "@cypher/types/scalar/float";
import { MakeOptional } from "@cypher/types/optional";

export function matchNode<
  TDef extends
    | string
    | NodeDefinitionClass
    | AbstractNodeDefinitionClass
    | NodeUnionDefinitionClass,
>(node: TDef): Query<Node<DefinitionFromClass<TDef>>, "many"> {
  return query_untyped(() => $matchNode(node));
}

export function optionalMatchNode<
  TDef extends
    | string
    | NodeDefinitionClass
    | AbstractNodeDefinitionClass
    | NodeUnionDefinitionClass,
>(node: TDef): Query<Node<DefinitionFromClass<TDef>>, "many"> {
  return query_untyped(() => $optionalMatchNode(node));
}

export function match<TPattern extends MatchPattern>(
  pattern: TPattern,
): Query<GetMatchPatternData<TPattern>, "many"> {
  return makeMatchQuery(pattern, false);
}

export const optionalMatch = <TPattern extends MatchPattern>(
  pattern: TPattern,
): Query<MakeQueryDataOptional<GetMatchPatternData<TPattern>>, "one-or-more"> => {
  return makeMatchQuery(pattern, true);
};

/*
  INTERNAL
 */

function makeMatchQuery(pattern: MatchPattern, isOptional: boolean): Query<any, any> {
  let i = 0;
  const input: Record<string, Value> = {};
  const keyMap = new Map<Value, string>();
  const { parts, outputShape } = MatchPattern.getData(pattern);

  parts.forEach(part => {
    if (part.value instanceof Value) {
      const key = `key${i++}`;
      input[key] = part.value;
      keyMap.set(part.value, key);
    }
  });

  const makeNewPattern = (data: Record<string, Value>) =>
    new MatchPattern({
      parts: parts.map(part =>
        part.value instanceof Value
          ? {
              ...part,
              value: data[keyMap.get(part.value)!] as any,
            }
          : part,
      ),
      outputShape,
    });

  const $matchOp = isOptional ? $optionalMatch : $match;
  return query_untyped(input, data => $matchOp(makeNewPattern(data)));
}
