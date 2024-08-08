import { Type } from "@core/type/type";

export type PatternVariableDeclaration = {
  _kind: "variable-declaration";
  type: Type;
};

export const patternVariableDeclaration = (type: Type): PatternVariableDeclaration => ({
  _kind: "variable-declaration",
  type,
});

export const isPatternVariableDeclaration = (
  value: any,
): value is PatternVariableDeclaration =>
  !!value && "_kind" in value && value["_kind"] === "variable-declaration";
