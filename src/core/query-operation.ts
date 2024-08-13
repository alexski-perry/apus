import { Clause } from "@core/clause";
import { MergeQueryData, QueryData } from "@core/query-data";
import { QueryStage } from "@core/query";
import { QueryOperationResolveInfo } from "@build/QueryOperationResolveInfo";
import { DataShape, mergeDataShape } from "@core/data-shape";
import { QueryCardinality } from "@core/query-cardinality";

export class QueryOperation<
  TData extends QueryData = QueryData,
  TCardinalityEffect extends OperationCardinalityBehaviour = OperationCardinalityBehaviour,
  TDataEffect extends OperationDataBehaviour = OperationDataBehaviour,
> {
  protected _typeInfo: [TData, TCardinalityEffect, TDataEffect] = null as any;

  constructor(private _data: QueryOperationData) {}

  static getData(query: QueryOperation) {
    return query._data;
  }
}

export function queryOperation(data: QueryOperationData): QueryOperation<any, any, any> {
  return new QueryOperation(data);
}

export interface QueryOperationData {
  name: string;
  resolver: (resolveInfo: QueryOperationResolveInfo) => {
    clauses: Clause[];
    outputShape: DataShape;
    dataBehaviour: OperationDataBehaviour;
    cardinalityBehaviour: OperationCardinalityBehaviour;
    additionalStages?: QueryStage<any>[];
  };
}

export type OperationDataBehaviour = "merge" | "overwrite";

export type ApplyDataBehaviour<
  TInputData extends QueryData,
  TData extends QueryData,
  TBehaviour extends OperationDataBehaviour,
> = TBehaviour extends "merge" ? MergeQueryData<TInputData, TData> : TData;

export function applyDataBehaviour(
  inputData: DataShape,
  data: DataShape,
  behaviour: OperationDataBehaviour,
) {
  return behaviour === "merge" ? mergeDataShape(inputData, data) : data;
}

export type OperationCardinalityBehaviour =
  | "->one"
  | "->none-or-one"
  | "->one-or-more"
  | "->many"
  | "<-one" // used for $first
  | "<-many" // used for $limit/$skip/$paginate
  | "!one"
  | "!none-or-one"
  | "!one-or-more"
  | "!many";

export type ApplyCardinalityBehaviour<
  TInputCardinality extends QueryCardinality,
  TBehaviour extends OperationCardinalityBehaviour,
> = {
  "->one": TInputCardinality;
  "->none-or-one": {
    one: "none-or-one";
    "none-or-one": "none-or-one";
    "one-or-more": "many";
    many: "many";
  }[TInputCardinality];
  "->one-or-more": {
    one: "one-or-more";
    "none-or-one": "many";
    "one-or-more": "one-or-more";
    many: "many";
  }[TInputCardinality];
  "->many": {
    one: "many";
    "none-or-one": "many";
    "one-or-more": "many";
    many: "many";
  }[TInputCardinality];
  "<-one": {
    one: "one";
    "none-or-one": "none-or-one";
    "one-or-more": "one";
    many: "none-or-one";
  }[TInputCardinality];
  "<-many": {
    one: "none-or-one";
    "none-or-one": "none-or-one";
    "one-or-more": "many";
    many: "many";
  }[TInputCardinality];
  "!one": "one";
  "!none-or-one": "none-or-one";
  "!one-or-more": "one-or-more";
  "!many": "many";
}[TBehaviour];

export function applyCardinalityBehaviour(
  inputCardinality: QueryCardinality,
  behaviour: OperationCardinalityBehaviour,
) {
  return {
    "->one": inputCardinality,
    "->none-or-one": {
      one: "none-or-one" as const,
      "none-or-one": "none-or-one" as const,
      "one-or-more": "many" as const,
      many: "many" as const,
    }[inputCardinality],
    "->one-or-more": {
      one: "one-or-more" as const,
      "none-or-one": "many" as const,
      "one-or-more": "one-or-more" as const,
      many: "many" as const,
    }[inputCardinality],
    "->many": {
      one: "many" as const,
      "none-or-one": "many" as const,
      "one-or-more": "many" as const,
      many: "many" as const,
    }[inputCardinality],
    "<-one": {
      one: "one" as const,
      "none-or-one": "none-or-one" as const,
      "one-or-more": "one" as const,
      many: "none-or-one" as const,
    }[inputCardinality],
    "<-many": {
      one: "none-or-one" as const,
      "none-or-one": "none-or-one" as const,
      "one-or-more": "many" as const,
      many: "many" as const,
    }[inputCardinality],
    "!one": "one" as const,
    "!none-or-one": "none-or-one" as const,
    "!one-or-more": "one-or-more" as const,
    "!many": "many" as const,
  }[behaviour];
}
