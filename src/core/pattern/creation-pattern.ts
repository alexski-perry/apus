import { QueryData } from "@core/query-data";
import { PatternOutputShape } from "@core/pattern/pattern-output-shape";
import { Value } from "@core/value";
import { PatternVariableDeclaration } from "@core/pattern/pattern-variable-declaration";

export interface CreationPatternData {
  parts: CreationPatternPart[];
  outputShape: PatternOutputShape;
}

export class CreationPattern<TData extends QueryData> {
  protected _typeInfo: [TData] = null as any;

  constructor(private _data: CreationPatternData) {}

  static getData(pattern: CreationPattern<any>) {
    return pattern._data;
  }
}

export type CreationPatternDirection = "->" | "<-";

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
