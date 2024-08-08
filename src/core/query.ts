import { Mapping, ParseMapping } from "@cypher/stages/$map";
import { GetQueryDataOutputType, MergeQueryData, QueryData } from "@core/query-data";
import { QueryCardinality } from "@core/query-cardinality";
import {
  QueryOperation,
  StageCardinalityBehaviour,
  StageDataBehaviour,
} from "@core/query-operation";
import {an} from "vitest/dist/chunks/reporters.C_zwCd4j";

export function query<
  T1 extends QueryInput,
  T1Data extends CalculateStageData<void, T1>,
  T1Cardinality extends CalculateStageCardinality<"one", T1>,
>(p1: T1): Query<T1Data, T1Cardinality>;

export function query<
  T1 extends QueryInput,
  T1Data extends CalculateStageData<void, T1>,
  T1Cardinality extends CalculateStageCardinality<"one", T1>,
  T2 extends QueryStage<T1Data>,
  T2Data extends CalculateStageData<T1Data, T2>,
  T2Cardinality extends CalculateStageCardinality<T1Cardinality, T2>,
>(p1: T1, p2: T2): Query<T2Data, T2Cardinality>;

export function query<
  T1 extends QueryInput,
  T1Data extends CalculateStageData<void, T1>,
  T1Cardinality extends CalculateStageCardinality<"one", T1>,
  T2 extends QueryStage<T1Data>,
  T2Data extends CalculateStageData<T1Data, T2>,
  T2Cardinality extends CalculateStageCardinality<T1Cardinality, T2>,
  T3 extends QueryStage<T2Data>,
  T3Data extends CalculateStageData<T2Data, T3>,
  T3Cardinality extends CalculateStageCardinality<T2Cardinality, T3>,
>(p1: T1, p2: T2, p3: T3): Query<T3Data, T3Cardinality>;

export function query<
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
>(p1: T1, p2: T2, p3: T3, p4: T4): Query<T4Data, T4Cardinality>;

export function query<
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
  T5 extends QueryStage<T4Data>,
  T5Data extends CalculateStageData<T4Data, T5>,
  T5Cardinality extends CalculateStageCardinality<T4Cardinality, T5>,
>(p1: T1, p2: T2, p3: T3, p4: T4, p5: T5): Query<T5Data, T5Cardinality>;

export function query<
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
  T5 extends QueryStage<T4Data>,
  T5Data extends CalculateStageData<T4Data, T5>,
  T5Cardinality extends CalculateStageCardinality<T4Cardinality, T5>,
  T6 extends QueryStage<T5Data>,
  T6Data extends CalculateStageData<T5Data, T6>,
  T6Cardinality extends CalculateStageCardinality<T5Cardinality, T6>,
>(p1: T1, p2: T2, p3: T3, p4: T4, p5: T5, p6: T6): Query<T6Data, T6Cardinality>;

export function query<
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
  T5 extends QueryStage<T4Data>,
  T5Data extends CalculateStageData<T4Data, T5>,
  T5Cardinality extends CalculateStageCardinality<T4Cardinality, T5>,
  T6 extends QueryStage<T5Data>,
  T6Data extends CalculateStageData<T5Data, T6>,
  T6Cardinality extends CalculateStageCardinality<T5Cardinality, T6>,
  T7 extends QueryStage<T6Data>,
  T7Data extends CalculateStageData<T6Data, T7>,
  T7Cardinality extends CalculateStageCardinality<T6Cardinality, T7>,
>(p1: T1, p2: T2, p3: T3, p4: T4, p5: T5, p6: T6, p7: T7): Query<T7Data, T7Cardinality>;

export function query(...stages: Array<QueryInput | QueryStage<any>>): Query<any, any> {
  return new Query([...stages]);
}

export function query_untyped(
  inputStage: QueryInput,
  ...stages: Array<QueryStage<any>>
): Query<any, any> {
  return new Query([inputStage, ...stages]);
}

export type QueryStage<TInput extends QueryData> = (input: TInput) => QueryStageResult;
export type QueryStageResult = QueryOperation<any, any, any> | Mapping<"1->1">;

export type QueryInput = Query<any, any> | QueryData | QueryStage<void>;
export type QueryInputResult = Query<any, any> | QueryData | QueryOperation<any, any, any>;

export type QueryStageOrInput = QueryStage<any> | QueryInput;
export type QueryStageOrInputResult = QueryStageResult | QueryInputResult;

export type CalculateStageData<
  TIn extends QueryData,
  TOut extends QueryStageOrInput,
> = TOut extends (...args: any[]) => QueryStageOrInputResult
  ? CalculateStageDataHelper<TIn, ReturnType<TOut>>
  : TOut extends QueryStageOrInputResult
    ? CalculateStageDataHelper<TIn, TOut>
    : never;

type CalculateStageDataHelper<
  TIn extends QueryData,
  TOut extends QueryStageOrInputResult,
> = TOut extends Mapping<"1->1">
  ? ParseMapping<TOut>
  : TOut extends Query<infer TData, QueryCardinality>
    ? TData
    : TOut extends QueryOperation<infer TData, StageCardinalityBehaviour, infer TType>
      ? TType extends "merge"
        ? MergeQueryData<TIn, TData>
        : TData
      : never;

export type CalculateStageCardinality<
  TIn extends QueryCardinality,
  TOut extends QueryStage<any> | QueryInput,
> = TOut extends (...args: any[]) => QueryStageResult | QueryInputResult
  ? CalculateStageCardinalityHelper<TIn, ReturnType<TOut>>
  : TOut extends QueryStageResult | QueryInputResult
    ? CalculateStageCardinalityHelper<TIn, TOut>
    : never;

type CalculateStageCardinalityHelper<
  TIn extends QueryCardinality,
  TOut extends QueryStageResult | QueryInputResult,
> = TOut extends Mapping<"1->1">
  ? TIn
  : TOut extends Query<QueryData, infer TCardinality>
    ? {
        one: TIn;
        "none-or-one": {
          one: "none-or-one";
          "none-or-one": "none-or-one";
          many: "many";
        }[TIn];
        many: "many";
      }[TCardinality]
    : TOut extends QueryOperation<QueryData, infer TCardinalityBehaviour, StageDataBehaviour>
      ? {
          same: TIn;
          optional: {
            one: "none-or-one";
            "none-or-one": "none-or-one";
            many: "many";
          }[TIn];
          "force-none-or-one": "none-or-one";
          "force-one": "one";
          "force-many": "many";
        }[TCardinalityBehaviour]
      : never;

export class Query<TData extends QueryData, TCardinality extends QueryCardinality> {
  protected _typeInfo: [TData, TCardinality] = null as any;

  constructor(private _stages: Array<QueryStageOrInput>) {}

  static resolve(query: Query<any, any>): QueryInfo {
    let stages = query._stages;
    let input: QueryData = undefined;

    const [inputStage, ...laterStages] = query._stages;
    if (inputStage instanceof Query) {
      const { input: innerInput, stages: innerStages } = Query.resolve(inputStage);
      input = innerInput;
      stages = [...innerStages, ...laterStages];
    } else if (typeof inputStage !== "function") {
      input = inputStage;
      stages = laterStages;
    }

    return { input, stages: stages as Array<QueryStage<any>> };
  }
}

export interface QueryInfo {
  input: QueryData;
  stages: Array<QueryStage<any>>;
}

/**
 * Calculates the output type of the query
 */
export type GetQueryOutput<
  TData extends QueryData,
  TCardinality extends QueryCardinality,
> = TCardinality extends "many"
  ? Array<GetQueryDataOutputType<TData>>
  : TCardinality extends "optional"
    ? GetQueryDataOutputType<TData> | undefined
    : GetQueryDataOutputType<TData>;

/**
 * Extracts the first generic parameter 'TData' of the Query<TData, TCardinality> type
 */
export type GetQueryData<T extends Query<any, any>> = T extends Query<
  infer TData extends QueryData,
  QueryCardinality
>
  ? TData
  : never;

/**
 * Extracts the second generic parameter 'TCardinality' of the Query<TData, TCardinality> type
 */
export type GetQueryCardinality<T extends Query<any, any>> = T extends Query<
  QueryData,
  infer TCardinality extends QueryCardinality
>
  ? TCardinality
  : never;
