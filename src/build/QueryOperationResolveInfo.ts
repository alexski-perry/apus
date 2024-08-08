import { buildSubquery, Environment } from "@build/buildQuery";
import { Type } from "@core/type/type";
import { Query } from "@core/query";
import { DataShape } from "@core/data-shape";
import { Value } from "@core/value";
import { isExpression, isParameter, isVariable, ValueInfo, Variable } from "@core/value-info";
import { MatchPatternData } from "@core/pattern/match-pattern";
import {
  isPatternVariableDeclaration,
  PatternVariableDeclaration,
} from "@core/pattern/pattern-variable-declaration";
import { CreateClausePattern, MatchClausePattern } from "@core/clause";
import { Optional } from "@cypher/types/optional";
import { deepMap } from "@utils/deepMap";
import { CreationPatternData } from "@core/pattern/creation-pattern";

export class QueryOperationResolveInfo {
  constructor(
    private _environment: Environment,
    private _valuesInScope: Set<Value>,
  ) {}

  public defineVariable(type: Type) {
    return this._environment.varBag.nextVariable(type);
  }

  public getBuildOptions() {
    return this._environment.buildOptions;
  }

  public resolveValue(value: Value): ValueInfo {
    const valueInfo = Value.getValueInfo(value);

    const dependencies = Value.getDependencies(value);
    for (const dep of dependencies) {
      if (!this._valuesInScope.has(dep)) {
        throw new Error("Attempted to use a value not in scope!");
      }
    }

    return valueInfo;
  }

  public resolveVariable(value: Value, error?: string): Variable {
    const valueInfo = this.resolveValue(value);

    if (!isVariable(valueInfo)) {
      throw new Error(error ?? "Expected variable");
    }

    return valueInfo;
  }

  public resolveSubquery(query: Query<any, any>, options?: { noReturn?: boolean }) {
    return buildSubquery(query, this._environment, { noReturn: options?.noReturn });
  }

  public resolveMatchPattern(patternData: MatchPatternData, makeOptional = false) {
    const labelExpressionsEnabled = this.getBuildOptions().version !== "4.1";

    const declaredVariables: WeakMap<PatternVariableDeclaration, Variable> = new Map();

    const pattern: MatchClausePattern = patternData.parts.map(part => {
      const { value } = part;

      let variable: Variable | null = null;

      if (value instanceof Value) {
        const valueData = this.resolveValue(value);
        if (valueData.kind !== "variable") throw new Error("a pattern can only use variables");
        variable = valueData;
      } else if (isPatternVariableDeclaration(value)) {
        if (declaredVariables.has(value)) {
          variable = declaredVariables.get(value)!;
        } else {
          variable = this.defineVariable(
            makeOptional ? Optional.makeType(value.type) : value.type,
          );
          declaredVariables.set(value, variable);
        }
      }

      switch (part.entityType) {
        case "node":
          return {
            entityType: "node",
            variable,
            nodeLabels: labelExpressionsEnabled ? part.nodeLabels : [],
          };
        case "relationship":
          return {
            entityType: "relationship",
            variable,
            direction: part.direction,
            relationshipNames: part.relationshipNames,
          };
      }
    });

    const dataShape: DataShape = deepMap(
      patternData.outputShape,
      val => isPatternVariableDeclaration(val),
      (variableDeclaration: PatternVariableDeclaration) => {
        const variable = declaredVariables.get(variableDeclaration);
        if (!variable)
          throw new Error("pattern attempted to output a variable that wasn't declared");
        return variable;
      },
    );

    return { pattern, dataShape };
  }

  public resolveCreationPattern(patternData: CreationPatternData) {
    const declaredVariables: WeakMap<PatternVariableDeclaration, Variable> = new Map();

    const pattern: CreateClausePattern = patternData.parts.map(part => {
      const { value } = part;

      let variable: Variable | null = null;

      if (value instanceof Value) {
        const valueData = this.resolveValue(value);
        if (valueData.kind !== "variable") throw new Error("a pattern can only use variables");
        variable = valueData;
      } else if (isPatternVariableDeclaration(value)) {
        if (declaredVariables.has(value)) {
          variable = declaredVariables.get(value)!;
        } else {
          variable = this.defineVariable(value.type);
          declaredVariables.set(value, variable);
        }
      }

      switch (part.entityType) {
        case "node":
          return {
            entityType: "node",
            variable,
            nodeLabels: part.nodeLabels,
          };
        case "relationship":
          return {
            entityType: "relationship",
            variable,
            direction: part.direction,
            relationshipNames: part.relationshipName,
          };
      }
    });

    const dataShape: DataShape = deepMap(
      patternData.outputShape,
      val => isPatternVariableDeclaration(val),
      (variableDeclaration: PatternVariableDeclaration) => {
        const variable = declaredVariables.get(variableDeclaration);
        if (!variable)
          throw new Error("pattern attempted to output a variable that wasn't declared");
        return variable;
      },
    );

    return { pattern, dataShape };
  }
}
