import {
  CalculateStageCardinality,
  CalculateStageData,
  GetQueryOutput,
  query_untyped,
  QueryInput,
  QueryStage,
  QueryStageOrInput,
} from "@core/query";
import { QueryResult } from "neo4j-driver";
import { buildRootQuery } from "@build/buildQuery";
import { makeTransformer } from "@build/makeTransformer";

export interface MakeQueryRunnerOptions {
  execute: (queryString: string, params: Record<string, any>) => Promise<QueryResult>;
}

export function makeQueryRunner(options: MakeQueryRunnerOptions): QueryRunner {
  const { execute } = options;

  return async (...stages: Array<QueryStageOrInput>) => {
    const start = performance.now();

    const { params, queryString, outputShape, cardinality } = buildRootQuery(
      query_untyped(...stages),
      {
        version: "5.9", // todo get from executor
      },
    );

    const transformer = makeTransformer({ outputShape, cardinality });
    const buildEnd = performance.now();
    const queryResult = execute(queryString, params);

    const end = performance.now();
    console.log(`BUILD TIME: ${buildEnd - start}ms`);
    console.log(`TOTAL EXECUTION TIME: ${end - start}ms`);
    return transformer(await queryResult);
  };
}

type QueryRunner = {
  <
    T1 extends QueryInput,
    T1Data extends CalculateStageData<void, T1>,
    T1Cardinality extends CalculateStageCardinality<"one", T1>,
  >(
    p1: T1,
  ): Promise<GetQueryOutput<T1Data, T1Cardinality>>;
  <
    T1 extends QueryInput,
    T1Data extends CalculateStageData<void, T1>,
    T1Cardinality extends CalculateStageCardinality<"one", T1>,
    T2 extends QueryStage<T1Data>,
    T2Data extends CalculateStageData<T1Data, T2>,
    T2Cardinality extends CalculateStageCardinality<T1Cardinality, T2>,
  >(
    p1: T1,
    p2: T2,
  ): Promise<GetQueryOutput<T2Data, T2Cardinality>>;
  <
    T1 extends QueryInput,
    T1Data extends CalculateStageData<void, T1>,
    T1Cardinality extends CalculateStageCardinality<"one", T1>,
    T2 extends QueryStage<T1Data>,
    T2Data extends CalculateStageData<T1Data, T2>,
    T2Cardinality extends CalculateStageCardinality<T1Cardinality, T2>,
    T3 extends QueryStage<T2Data>,
    T3Data extends CalculateStageData<T2Data, T3>,
    T3Cardinality extends CalculateStageCardinality<T2Cardinality, T3>,
  >(
    p1: T1,
    p2: T2,
    p3: T3,
  ): Promise<GetQueryOutput<T3Data, T3Cardinality>>;
  <
    T1 extends QueryInput,
    T1Data extends CalculateStageData<void, T1>,
    T1Cardinality extends CalculateStageCardinality<"one", T1>,
    T2 extends QueryStage<T1Data>,
    T2Data extends CalculateStageData<T1Data, T2>,
    T2Cardinality extends CalculateStageCardinality<T1Cardinality, T2>,
    T3 extends QueryStage<T2Data>,
    T3Data extends CalculateStageData<T2Data, T3>,
    T3Cardinality extends CalculateStageCardinality<T2Cardinality, T3>,
    T4 extends QueryStage<T3Data>,
    T4Data extends CalculateStageData<T3Data, T4>,
    T4Cardinality extends CalculateStageCardinality<T3Cardinality, T4>,
  >(
    p1: T1,
    p2: T2,
    p3: T3,
    p4: T4,
  ): Promise<GetQueryOutput<T4Data, T4Cardinality>>;
};
