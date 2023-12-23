import { Type } from "@core/type";
import { Value } from "@core/value";

export type ValueData = Variable | Parameter | Expression;

export interface Variable {
  kind: "variable";
  type: Type;
  index: number;
}

export interface Parameter {
  kind: "parameter";
  type: Type;
  value: any;
}

export interface Expression {
  kind: "expression";
  type: Type;
  print: ExpressionPrintFn;
  dependencies: Array<number>;
}

export type ExpressionPrintFn = (
  level: number,
  // helpers to simplify nested printing
  utils: {
    printValue: (value: ValueData) => string;
    printIndent: (level: number) => string;
  },
) => string;

export const isValueData = (value: any): value is ValueData =>
  !!value && "kind" in value && ["variable", "parameter", "expression"].includes(value.kind);

export const isVariable = (value: any): value is Variable =>
  !!value && "kind" in value && value.kind === "variable";

export const asValue = (valueData: ValueData): Value =>
  Value.create(valueData.type, valueData);
