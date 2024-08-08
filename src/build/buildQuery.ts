import { Clause, ClauseMapping, ReturnClause } from "@core/clause";
import { isExpression, isParameter, isVariable, Variable } from "@core/value-info";
import { Query, QueryStage } from "@core/query";
import { Value } from "@core/value";
import { mapQueryData, QueryData } from "@core/query-data";
import { QueryOperation } from "@core/query-operation";
import { VarBag } from "@build/var-bag";
import { ParamRegistry } from "@build/param-registry";
import { printClauses } from "@build/print";
import { BuildOptions } from "@build/build-options";
import { Any } from "@cypher/types/any";
import { expression } from "@core/expression";
import { QueryCardinality } from "@core/query-cardinality";
import { QueryOperationResolveInfo } from "@build/QueryOperationResolveInfo";
import { $map } from "@cypher/stages/$map";
import { DataShape, mapDataShape, mergeDataShape } from "@core/data-shape";

export interface Environment {
  varBag: VarBag;
  activeQueryClauses: Clause[];
  buildOptions: BuildOptions;
  cardinality: QueryCardinality;
  dataShape: DataShape;
}

export const buildRootQuery = (query: Query<any, any>, buildOptions: BuildOptions) => {
  const { input } = Query.resolve(query);
  if (input) throw new Error("Root query can't have input!");

  const varBag = new VarBag();
  const environment: Environment = {
    dataShape: undefined,
    cardinality: "one",
    activeQueryClauses: [],
    varBag,
    buildOptions,
  };

  const { outputShape, cardinality, clauses } = buildSubquery(query, environment);

  const paramRegistry = new ParamRegistry();
  const queryLines = printClauses(clauses, 0, paramRegistry);

  return {
    queryString: queryLines.join("\n"),
    params: paramRegistry.getParams(),
    cardinality,
    outputShape,
  };
};

export const buildSubquery = (
  query: Query<any, any>,
  outerScopeEnvironment: Environment,
  options?: { noReturn?: boolean },
) => {
  const { input, stages } = Query.resolve(query);

  const inputVariables: Array<Variable> = [];
  const dataShape: DataShape = mapQueryData(input, inputValue => {
    const valueInfo = Value.getValueInfo(inputValue);

    if (isExpression(valueInfo)) {
      throw new Error("can't import composite expression into subquery");
    }

    if (isVariable(valueInfo)) {
      inputVariables.push(valueInfo);
    }

    return valueInfo;
  });

  let environment: Environment = {
    dataShape,
    cardinality: "one",
    // valuesInScope,
    activeQueryClauses: [],
    buildOptions: outerScopeEnvironment.buildOptions,
    varBag: outerScopeEnvironment.varBag,
  };

  if (inputVariables.length > 0) {
    environment.activeQueryClauses.push({
      type: "IMPORT WITH",
      variables: inputVariables,
    });
  }

  for (const stage of stages) {
    environment = applyStage(stage, environment);
  }

  environment = applyReturn(environment);

  return {
    cardinality: environment.cardinality,
    outputShape: environment.dataShape,
    clauses: environment.activeQueryClauses,
  };
};

function applyStage(
  stage: QueryStage<any>,
  prevEnvironment: Environment,
  level = 0,
): Environment {
  const valuesInScope = new Set<Value>();

  const inputData: QueryData = mapDataShape(prevEnvironment.dataShape, valueInfo => {
    const value = Value.create(valueInfo.type, valueInfo, "self");
    valuesInScope.add(value);
    return value;
  });

  const stageResult = stage(inputData);
  const operation = stageResult instanceof QueryOperation ? stageResult : $map(stageResult);

  const { name, resolver } = QueryOperation.getData(operation);

  // console.log("   ".repeat(level) + name);

  // standard resolver

  const { clauses, outputShape, cardinalityBehaviour, dataBehaviour, additionalStages } =
    resolver(new QueryOperationResolveInfo(prevEnvironment, valuesInScope));

  const dataShape =
    dataBehaviour === "overwrite"
      ? outputShape
      : mergeDataShape(prevEnvironment.dataShape, outputShape);

  const cardinality = {
    same: prevEnvironment.cardinality,
    optional: {
      one: "none-or-one" as const,
      "none-or-one": "none-or-one" as const,
      many: "many" as const,
    }[prevEnvironment.cardinality],
    "force-one": "one" as const,
    "force-none-or-one": "none-or-one" as const,
    "force-many": "many" as const,
  }[cardinalityBehaviour];

  let environment: Environment = {
    dataShape,
    cardinality,
    activeQueryClauses: [...prevEnvironment.activeQueryClauses, ...clauses],
    varBag: prevEnvironment.varBag,
    buildOptions: prevEnvironment.buildOptions,
  };

  for (const additionalStage of additionalStages ?? []) {
    environment = applyStage(additionalStage, environment, level + 1);
  }

  return environment;
}

function applyReturn(prevEnvironment: Environment): Environment {
  if (!prevEnvironment.dataShape) {
    const emptyReturnClause: ReturnClause = {
      type: "RETURN",
      isDistinct: false,
      mappings: [
        {
          input: Value.getValueInfo(expression(Any)`count(null)`),
          output: prevEnvironment.varBag.nextVariable(Any),
        },
      ],
    };

    return {
      dataShape: undefined,
      cardinality: prevEnvironment.cardinality,
      activeQueryClauses: [...prevEnvironment.activeQueryClauses, emptyReturnClause],
      buildOptions: prevEnvironment.buildOptions,
      varBag: prevEnvironment.varBag,
    };
  }

  // we have something to return

  const returnMappings: Array<ClauseMapping> = [];

  const dataShape: DataShape = mapDataShape(prevEnvironment.dataShape, valueInfo => {
    if (isVariable(valueInfo)) {
      returnMappings.push({
        output: valueInfo,
      });
      return valueInfo;
    }

    // if (isExpression(valueInfo)) {
    //   const newVariable = prevEnvironment.varBag.nextVariable(valueInfo.type);
    //
    //   returnMappings.push({
    //     input: valueInfo,
    //     output: newVariable,
    //   });
    //
    //   return valueInfo;
    // }

    if (isParameter(valueInfo)) {
      return valueInfo;
    }
  });

  return {
    dataShape,
    cardinality: prevEnvironment.cardinality,
    activeQueryClauses: [
      ...prevEnvironment.activeQueryClauses,
      { type: "RETURN", isDistinct: false, mappings: returnMappings },
    ],
    buildOptions: prevEnvironment.buildOptions,
    varBag: prevEnvironment.varBag,
  };
}
