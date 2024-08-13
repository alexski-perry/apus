import { QueryData } from "@core/query-data";
import { PatternOutputShape } from "@core/pattern/pattern-output-shape";
import { PatternVariableDeclaration } from "@core/pattern/pattern-variable-declaration";
import { Node } from "@cypher/types/structural/node";
import { Optional } from "@cypher/types/optional";
import { Relationship } from "@cypher/types/structural/relationship";

export class MatchPattern<TData extends QueryData = QueryData> {
  protected _typeInfo: [TData] = null as any;

  constructor(private _data: MatchPatternData) {}

  static getData(pattern: MatchPattern<any>) {
    return pattern._data;
  }
}

export interface MatchPatternData {
  parts: MatchPatternPart[];
  outputShape: PatternOutputShape;
}

export type MatchPatternDirection = "->" | "<-" | "--";
export type MatchPatternNodeValue = Node | Optional<Node>;
export type MatchPatternRelationshipValue = Relationship | Optional<Relationship>;

export type MatchPatternPart =
  | {
      entityType: "node";
      value: MatchPatternNodeValue | PatternVariableDeclaration | null;
      nodeLabels: string[];
    }
  | {
      entityType: "relationship";
      value: MatchPatternRelationshipValue | PatternVariableDeclaration | null;
      direction: MatchPatternDirection;
      relationshipNames: string[];
    };

/**
 * Extracts the first generic parameter 'TData' of the Pattern<TData, TCardinality> type
 */
export type GetMatchPatternData<TPattern extends MatchPattern<any>> =
  TPattern extends MatchPattern<infer TData> ? TData : never;
