import { Query, QueryData, QueryPipelineStage } from "@core";
import { Clause } from "@core/clause";
import { DataShape } from "@core/data-shape";

export type StageCardinalityBehaviour =
  | "same"
  | "optional"
  | "force-one"
  | "force-none-or-one"
  | "force-many";

export type StageDataBehaviour = "merge" | "overwrite";

export interface QueryStageData {
  outputShape: DataShape;
  clauses: Clause[];
  dataBehaviour: StageDataBehaviour;
  cardinalityBehaviour: StageCardinalityBehaviour;
  additionalStages?: QueryPipelineStage[]; // allows resolver to recursively add stages (useful when mapping a query flat)
}

export class QueryStage<
  TData extends QueryData,
  TCardinalityEffect extends StageCardinalityBehaviour,
  TDataEffect extends StageDataBehaviour,
> {
  private declare _typeInfo: [TData, TCardinalityEffect, TDataEffect];

  constructor(private _data: QueryStageData) {}

  static getData(query: QueryStage<any, any, any>) {
    return query._data;
  }
}

export const queryStage = (resolver: QueryStageData): QueryStage<any, any, any> =>
  new QueryStage<any, any, any>(resolver);

export const mergeIntoQueryStage = (query: Query<any, any>) => {
  const { stages } = Query.getData(query);
  return queryStage({
    clauses: [],
    outputShape: undefined,
    cardinalityBehaviour: "same",
    dataBehaviour: "merge",
    additionalStages: stages,
  });
};
