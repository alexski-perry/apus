import { Cardinality, QueryData, Value } from "@core";
import { Type } from "@core/type";

export interface MatchPatternData {
  parts: MatchPatternPart[];
  cardinality: Cardinality;
  outputShape: PatternOutputShape;
}

export class MatchPattern<TData extends QueryData, TCardinality extends Cardinality> {
  private declare _type: [TData, TCardinality];

  constructor(private _data: MatchPatternData) {}

  static getData(pattern: MatchPattern<any, any>) {
    return pattern._data;
  }
}

export interface CreationPatternData {
  parts: CreationPatternPart[];
  outputShape: PatternOutputShape;
}

export class CreationPattern<TData extends QueryData> {
  private declare _type: [TData];

  constructor(private _data: CreationPatternData) {}

  static getData(pattern: CreationPattern<any>) {
    return pattern._data;
  }
}

export type PatternOutputShape =
  | undefined
  | PatternVariableDeclaration
  | {
      [key: string]: PatternVariableDeclaration;
    }
  | [PatternVariableDeclaration, PatternVariableDeclaration]
  | [PatternVariableDeclaration, PatternVariableDeclaration, PatternVariableDeclaration];

export type MatchPatternDirection = "->" | "<-" | "--";
export type CreationPatternDirection = "->" | "<-";

export type MatchPatternPart =
  | {
      entityType: "node";
      value: Value | PatternVariableDeclaration | null;
      nodeLabels: string[];
    }
  | {
      entityType: "relationship";
      value: Value | PatternVariableDeclaration | null;
      direction: MatchPatternDirection;
      relationshipNames: string[];
    };

export type CreationPatternPart =
  | {
      entityType: "node";
      value: Value | PatternVariableDeclaration | null;
      nodeLabels: string[];
    }
  | {
      entityType: "relationship";
      value: PatternVariableDeclaration | null;
      direction: CreationPatternDirection;
      relationshipName: string;
    };

/*
  PATTERN VARIABLE DECLARATION
 */

export type PatternVariableDeclaration = {
  _kind: "variable-declaration";
  type: Type;
};

export const declarePatternVariable = (type: Type): PatternVariableDeclaration => ({
  _kind: "variable-declaration",
  type,
});

export const isPatternVariableDeclaration = (
  value: any,
): value is PatternVariableDeclaration =>
  !!value && "_kind" in value && value["_kind"] === "variable-declaration";

/*
  UTILS
 */

export const getVariablesFromPattern = (pattern: MatchPattern<any, any>): QueryData => {
  let i = 0;
  const output: Record<string, Value> = {};
  MatchPattern.getData(pattern).parts.forEach(part => {
    if (part.value instanceof Value) {
      output[`key${i++}`] = part.value;
    }
  });
  return output;
};
