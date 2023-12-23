import {
  Cardinality,
  QueryData,
  QueryStage,
  StageCardinalityBehaviour,
  StageDataBehaviour,
} from "@core";
import { Mapping, ParseMapping } from "@cypher/stages/$map";
import { MergeQueryData, QueryDataOutput } from "@core/utils";
import { buildRootQuery } from "neo4j-querier";
import { QueryResult } from "neo4j-driver";
import { makeTransformer } from "neo4j-querier/build/makeTransformer";

export type QueryPipelineStage = (input: QueryData) => PipeOutput;

export class Query<TData extends QueryData, TCardinality extends Cardinality> {
  private declare _type: [TData, TCardinality];

  constructor(
    private _data: {
      input: QueryData; // if an input exists, will be a subquery
      stages: Array<QueryPipelineStage>;
    },
  ) {}

  public pipe<T extends PipeOutput>(
    pipe: (input: TData) => T,
  ): Query<CalculateData<TData, T>, CalculateCardinality<TCardinality, T>> {
    const current = this._data;
    return new Query({
      input: current.input,
      stages: [...current.stages, pipe as unknown as (input: QueryData) => PipeOutput],
    });
  }

  public build() {
    return buildRootQuery(this);
  }

  public async run(
    executor: (queryString: string, params: Record<string, any>) => Promise<QueryResult>,
  ): Promise<GetQueryOutput<TData, TCardinality>> {
    const start = performance.now();

    const { params, queryString, outputShape, cardinality } = buildRootQuery(this);
    const transformer = makeTransformer({ outputShape, cardinality });
    const buildEnd = performance.now();
    const queryResult = executor(queryString, params);

    const end = performance.now();
    console.log(`BUILD TIME: ${buildEnd - start}ms`);
    console.log(`TOTAL EXECUTION TIME: ${end - start}ms`);
    return transformer(await queryResult);
  }

  static getData(query: Query<any, any>) {
    return query._data;
  }
}

/*
   HELPER TYPES
 */

/**
 * Extracts the first generic parameter 'TData' of the Query<TData, TCardinality> type
 */
export type GetQueryData<T extends Query<any, any>> = T extends Query<
  infer TData extends QueryData,
  Cardinality
>
  ? TData
  : never;

/**
 * Extracts the second generic parameter 'TCardinality' of the Query<TData, TCardinality> type
 */
export type GetQueryCardinality<T extends Query<any, any>> = T extends Query<
  QueryData,
  infer TCardinality extends Cardinality
>
  ? TCardinality
  : never;

export type GetQueryOutput<
  TData extends QueryData,
  TCardinality extends Cardinality,
> = TCardinality extends "many" ? Array<QueryDataOutput<TData>> : QueryDataOutput<TData>;

/*
   INTERNAL TYPES
 */

type PipeOutput = Mapping<"1->1"> | QueryStage<any, any, any>;

type CalculateData<
  TIn extends QueryData,
  TOut extends PipeOutput,
> = TOut extends Mapping<"1->1">
  ? ParseMapping<TOut>
  : TOut extends Query<infer TData, Cardinality>
  ? TData
  : TOut extends QueryStage<infer TData, StageCardinalityBehaviour, infer TType>
  ? TType extends "merge"
    ? MergeQueryData<TIn, TData>
    : TData
  : never;

type CalculateCardinality<
  TCardinalityIn extends Cardinality,
  TOut extends PipeOutput,
> = TOut extends Mapping<"1->1">
  ? TCardinalityIn
  : TOut extends Query<QueryData, infer TCardinality>
  ? {
      one: TCardinalityIn;
      "none-or-one": {
        one: "none-or-one";
        "none-or-one": "none-or-one";
        many: "many";
      }[TCardinalityIn];
      many: "many";
    }[TCardinality]
  : TOut extends QueryStage<QueryData, infer TCardinalityBehaviour, StageDataBehaviour>
  ? {
      same: TCardinalityIn;
      optional: {
        one: "none-or-one";
        "none-or-one": "none-or-one";
        many: "many";
      }[TCardinalityIn];
      "force-none-or-one": "none-or-one";
      "force-one": "one";
      "force-many": "many";
    }[TCardinalityBehaviour]
  : never;
