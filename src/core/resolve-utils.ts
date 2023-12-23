import { ConstructorOf } from "@utils/ConstructorOf";
import { Value } from "@core/value";
import { getBuildState } from "neo4j-querier/build/current-build-state";
import { ValueData, Variable } from "@core/value-data";
import { CreateClausePattern, MatchPattern } from "@core/clause";
import { DataShape } from "@core/data-shape";
import { Query } from "@core/query";
import { applyReturn, buildSubquery } from "neo4j-querier/build/buildQuery";
import {
  CreationPatternData,
  isPatternVariableDeclaration,
  MatchPatternData,
  PatternVariableDeclaration,
} from "@core/pattern";
import { Optional } from "@cypher/types";
import { deepMap } from "@utils/deepMap";
import { Cardinality } from "@core/cardinality";
import { ClauseList } from "@core/clause-list";

export const defineVariable$ = (type: ConstructorOf<Value>) => {
  const buildState = getBuildState("defineVariable$");
  return buildState.varBag.nextVariable(type);
};

export const resolveValue$ = (value: Value): ValueData => {
  const buildState = getBuildState("resolveValue$");

  const valueData = Value.getValueData(value);

  const checkInScope = (varNum: number) => {
    if (!buildState.variablesInScope.has(varNum)) {
      throw new Error("attempted to use variable not in scope!");
    }
  };

  if (valueData.kind === "variable") {
    checkInScope(valueData.index);
  }

  if (valueData.kind === "expression") {
    valueData.dependencies.forEach(varNum => {
      checkInScope(varNum);
    });
  }

  return valueData;
};

export const resolveVariable$ = (value: Value, errorMessage?: string): Variable => {
  getBuildState("resolveVariable$");

  const valueData = resolveValue$(value);

  if (valueData.kind !== "variable") {
    throw new Error(errorMessage ?? "expected variable");
  }

  return valueData;
};

export const resolveMatchPattern$ = (patternData: MatchPatternData, makeOptional = false) => {
  getBuildState("resolveMatchPattern$");

  const declaredVariables: WeakMap<PatternVariableDeclaration, Variable> = new Map();

  const pattern: MatchPattern = patternData.parts.map(part => {
    const { value } = part;

    let variable: Variable | null = null;

    if (value instanceof Value) {
      const valueData = resolveValue$(value);
      if (valueData.kind !== "variable") throw new Error("a pattern can only use variables");
      variable = valueData;
    } else if (isPatternVariableDeclaration(value)) {
      if (declaredVariables.has(value)) {
        variable = declaredVariables.get(value)!;
      } else {
        variable = defineVariable$(makeOptional ? Optional.of(value.type) : value.type);
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
};

export const resolveCreationPattern$ = (patternData: CreationPatternData) => {
  getBuildState("resolveCreationPattern$");

  const declaredVariables: WeakMap<PatternVariableDeclaration, Variable> = new Map();

  const pattern: CreateClausePattern = patternData.parts.map(part => {
    const { value } = part;

    let variable: Variable | null = null;

    if (value instanceof Value) {
      const valueData = resolveValue$(value);
      if (valueData.kind !== "variable") throw new Error("a pattern can only use variables");
      variable = valueData;
    } else if (isPatternVariableDeclaration(value)) {
      if (declaredVariables.has(value)) {
        variable = declaredVariables.get(value)!;
      } else {
        variable = defineVariable$(value.type);
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
};

export const resolveSubquery$ = (
  query: Query<any, any>,
  options?: { noReturn?: boolean },
): {
  outputShape: DataShape;
  clauses: ClauseList;
  cardinality: Cardinality;
} => {
  let buildState = getBuildState("resolveSubquery$");

  buildState = buildSubquery({
    varBag: buildState.varBag,
    query,
    variablesFromOuterScope: buildState.variablesInScope,
  });

  if (!options?.noReturn) {
    buildState = applyReturn(buildState);
  }

  return {
    outputShape: buildState.dataShape,
    clauses: buildState.clauseList,
    cardinality: buildState.cardinality,
  };
};
