import { RelationModel } from "@schema/models";
import { QueryStage, Value } from "@core";

type RelationOperationResolver = (args: {
  entityValue: Value;
  relationModel: RelationModel;
}) => QueryStage<any, any, any>[];

export class RelationOperation {
  protected constructor(private resolver: RelationOperationResolver) {}

  static getStages(
    operation: RelationOperation,
    args: Parameters<RelationOperationResolver>[0],
  ) {
    return operation.resolver(args);
  }
}
