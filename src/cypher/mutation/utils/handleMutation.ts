import { castArray } from "@utils/castArray";
import { AbstractNodeModel, NodeModel, RelationshipModel } from "@schema/model";
import { Value } from "@core/value";
import { RelationOperation } from "@cypher/mutation/operations/RelationOperation";
import { makeParam } from "@core/makeParam";
import { Clause, setPropertyClause } from "@core/clause";
import { QueryOperationResolveInfo } from "@build/QueryOperationResolveInfo";
import { Variable } from "@core/value-info";

export const handleMutation = (args: {
  resolveInfo: QueryOperationResolveInfo;
  targetVariable: Variable;
  entityModel: NodeModel | AbstractNodeModel | RelationshipModel | null;
  data: Record<string, any>;
  mutationType: "create" | "update";
}): Clause[] => {
  const { entityModel: model, data, targetVariable, mutationType, resolveInfo } = args;

  // todo support untyped mutations
  if (!model) throw new Error("untyped not yet supported");

  const clauses: Clause[] = [];

  Object.values(model.properties).forEach(propertyModel => {
    const providedData = data[propertyModel.key];

    const providedValue: Value | undefined =
      providedData !== undefined ? makeParam(providedData, propertyModel.type) : undefined;

    let value: Value | undefined;

    const autogenInfo =
      mutationType === "create"
        ? propertyModel.creationStrategy.kind === "autogen"
          ? propertyModel.creationStrategy
          : undefined
        : propertyModel.updateStrategy.kind === "autogen"
          ? propertyModel.updateStrategy
          : undefined;

    if (autogenInfo) {
      const autoGenValue = makeParam(autogenInfo.autogenValue, propertyModel.type);

      value = autogenInfo.canOverride
        ? providedValue !== undefined
          ? providedValue
          : autoGenValue
        : autoGenValue;
    } else {
      value = providedValue;
    }

    if (value) {
      clauses.push(
        setPropertyClause({
          entity: targetVariable,
          propertyName: propertyModel.name,
          value: Value.getValueInfo(value),
        }),
      );
    }
  });

  if (model.kind === "Node") {
    Object.values(model.relations).forEach(relationModel => {
      const provided = castArray(data[relationModel.key]);

      provided.forEach(providedItem => {
        if (providedItem === "auto") return;

        if (providedItem instanceof RelationOperation) {
          clauses.push(
            ...RelationOperation.getClauses(providedItem, {
              relationModel,
              targetVariable,
              targetModel: model,
              resolveInfo,
            }),
          );
        } else {
          throw new Error("Unsupported mutation operation"); // todo better error message
        }
      });
    });
  }

  return clauses;
};
