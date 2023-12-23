import { Query, QueryData, QueryStage, QueryPipelineStage, Value } from "@core";
import { ClauseMapping } from "@core/clause";
import { printClauses } from "./print";
import { mapQueryData } from "@core/utils";
import { $map } from "@cypher/stages";
import { Variable } from "@core/value-data";
import { CurrentBuildState } from "neo4j-querier/build/current-build-state";
import { DataShape, mapDataShape } from "@core/data-shape";
import { VarBag } from "neo4j-querier/build/var-bag";
import { QueryBuildState } from "neo4j-querier/build/query-build-state";
import { ParamRegistry } from "neo4j-querier/build/param-registry";

export const buildRootQuery = (query: Query<any, any>) => {
  const { stages, input } = Query.getData(query);

  if (input) throw new Error("can't build a subquery!");

  const varBag = new VarBag();
  const initialBuildState = QueryBuildState.initial(varBag);

  const finalBuildState = applyReturn(applyQueryStages(stages, initialBuildState));

  const paramRegistry = new ParamRegistry();
  const queryLines = printClauses(finalBuildState.clauseList.getClauses(), 0, paramRegistry);

  return {
    queryString: queryLines.join("\n"),
    params: paramRegistry.getParams(),
    cardinality: finalBuildState.cardinality,
    outputShape: finalBuildState.dataShape,
  };
};

export const buildSubquery = (args: {
  query: Query<any, any>;
  variablesFromOuterScope: Set<number>;
  varBag: VarBag;
}): QueryBuildState => {
  const { query, variablesFromOuterScope, varBag } = args;
  const { input, stages } = Query.getData(query);

  let buildState = QueryBuildState.initial(varBag);

  const inputVariables: Variable[] = [];
  const inputShape: DataShape = mapQueryData(input, inputValue => {
    const rawValue = Value.getValueData(inputValue);
    if (rawValue.kind === "expression") {
      throw new Error("can't import composite expression into subquery");
    } else if (rawValue.kind === "variable") {
      if (!variablesFromOuterScope.has(rawValue.index)) {
        throw new Error("attempted to import variable not in scope");
      }
      inputVariables.push(rawValue);
      return rawValue;
    } else {
      return rawValue;
    }
  });

  if (inputVariables.length) {
    buildState = QueryBuildState.update(buildState, {
      dataBehaviour: "overwrite",
      dataShape: inputShape,
      cardinalityBehaviour: "same",
      clauses: [
        {
          type: "IMPORT WITH",
          variables: inputVariables,
        },
      ],
    });
  }

  return applyQueryStages(stages, buildState);
};

export const applyQueryStages = (
  stages: QueryPipelineStage[],
  initialBuildState: QueryBuildState,
): QueryBuildState => {
  let buildState = initialBuildState;

  const applyQueryStage = (stage: QueryPipelineStage) => {
    const input: QueryData = mapDataShape(
      buildState.dataShape,
      (rawValue): Value => Value.create(rawValue.type, rawValue),
    );

    const previousBuildState = CurrentBuildState.current;
    CurrentBuildState.current = buildState;

    const stageOutput = stage(input);
    const queryOp = stageOutput instanceof QueryStage ? stageOutput : $map(stageOutput);

    const {
      outputShape: stageOutputShape,
      clauses,
      additionalStages,
      dataBehaviour,
      cardinalityBehaviour,
    } = QueryStage.getData(queryOp);

    CurrentBuildState.current = previousBuildState;

    buildState = QueryBuildState.update(buildState, {
      clauses,
      dataShape: stageOutputShape,
      cardinalityBehaviour,
      dataBehaviour,
    });

    if (additionalStages) {
      additionalStages.forEach(additionalStage => {
        applyQueryStage(additionalStage);
      });
    }
  };

  stages.forEach(stage => {
    applyQueryStage(stage);
  });

  return buildState;
};

export const applyReturn = (buildState: QueryBuildState): QueryBuildState => {
  if (!buildState.dataShape) return buildState; // do nothing if there is nothing to return

  const returnMappings: Array<ClauseMapping> = [];

  const returnDataShape = mapDataShape(buildState.dataShape, (value): Variable => {
    if (value.kind === "variable") {
      returnMappings.push({ output: value });
      return value;
    } else {
      const newVariable = buildState.varBag.nextVariable(value.type);
      returnMappings.push({ output: newVariable, input: value });
      return newVariable;
    }
  });

  return QueryBuildState.update(buildState, {
    dataBehaviour: "overwrite",
    cardinalityBehaviour: "same",
    dataShape: returnDataShape,
    clauses: [
      {
        type: "RETURN",
        isDistinct: false,
        mappings: returnMappings,
      },
    ],
  });
};
