import { PatternVariableDeclaration } from "@core/pattern/pattern-variable-declaration";

export type PatternOutputShape =
  | undefined
  | PatternVariableDeclaration
  | {
      [key: string]: PatternVariableDeclaration;
    }
  | [PatternVariableDeclaration, PatternVariableDeclaration]
  | [PatternVariableDeclaration, PatternVariableDeclaration, PatternVariableDeclaration];
