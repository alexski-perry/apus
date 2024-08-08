import { Type } from "@core/type/type";

export type ValueInfo = Variable | Parameter | Expression;

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
}

export type ExpressionPrintFn = (
  level: number,
  // helpers to simplify nested printing
  utils: {
    printValue: (value: ValueInfo) => string;
    printIndent: (level: number) => string;
  },
) => string;

export const isValueInfo = (value: any): value is ValueInfo =>
  !!value && "kind" in value && ["variable", "parameter", "expression"].includes(value.kind);

export const isVariable = (value: any): value is Variable =>
  !!value && "kind" in value && value.kind === "variable";

export const isParameter = (value: any): value is Parameter =>
  !!value && "kind" in value && value.kind === "parameter";

export const isExpression = (value: any): value is Expression =>
  !!value && "kind" in value && value.kind === "expression";
