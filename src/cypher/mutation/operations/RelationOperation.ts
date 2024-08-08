import { AbstractNodeModel, NodeModel, RelationModel } from "@schema/model";
import { QueryOperationResolveInfo } from "@build/QueryOperationResolveInfo";
import { Clause } from "@core/clause";
import { Variable } from "@core/value-info";

type RelationOperationResolver = (args: {
  relationModel: RelationModel;
  resolveInfo: QueryOperationResolveInfo;
  targetVariable: Variable;
  targetModel: NodeModel | AbstractNodeModel | string;
}) => Clause[];

export class RelationOperation {
  protected constructor(private _resolver: RelationOperationResolver) {}

  static getClauses(
    operation: RelationOperation,
    input: Parameters<RelationOperationResolver>[0],
  ) {
    return operation._resolver(input);
  }
}
