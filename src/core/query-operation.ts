import { Clause } from "@core/clause";
import { QueryData } from "@core/query-data";
import { Query, QueryStage } from "@core/query";
import { QueryOperationResolveInfo } from "@build/QueryOperationResolveInfo";
import { DataShape } from "@core/data-shape";

export class QueryOperation<
  TData extends QueryData = QueryData,
  TCardinalityEffect extends StageCardinalityBehaviour = StageCardinalityBehaviour,
  TDataEffect extends StageDataBehaviour = StageDataBehaviour,
> {
  private declare _typeInfo: [TData, TCardinalityEffect, TDataEffect];

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
  resolver: QueryOperationResolver;
}

interface QueryOperationResolveData {
  clauses: Clause[];
  outputShape: DataShape;
  dataBehaviour: StageDataBehaviour;
  cardinalityBehaviour: StageCardinalityBehaviour;
  additionalStages?: QueryStage<any>[];
}

type QueryOperationResolver = (
  resolveInfo: QueryOperationResolveInfo,
) => QueryOperationResolveData;

export type StageCardinalityBehaviour =
  | "same"
  | "optional"
  | "force-one"
  | "force-none-or-one"
  | "force-many";

export type StageDataBehaviour = "merge" | "overwrite";
