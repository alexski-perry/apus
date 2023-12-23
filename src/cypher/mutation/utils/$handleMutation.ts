import { mergeIntoQueryStage, Query, QueryStage, Value } from "@core";
import { relationship, RelationOperation } from "@cypher/mutation";
import {
  AbstractNodeModel,
  NodeInterfaceModel,
  NodeModel,
  RelationshipModel,
} from "@schema/models";
import { castArray } from "@utils/castArray";
import { constructorOf } from "@utils/ConstructorOf";
import { parameterize } from "@cypher/expression/param";
import { CallSubqueryClause, RemovePropertyClause, SetPropertyClause } from "@core/clause";
import { resolveValue$ } from "@core/resolve-utils";
import { RelateToOperation } from "@cypher/mutation/operations/relate-to";
import { NodeUnionValue, NodeValue, RelationshipValue } from "@cypher/types";
import { query, subquery } from "@cypher/query";
import { $setProperty } from "@cypher/stages/unsafe/$setProperty";

export const $handleMutation = (args: {
  entityValue: NodeValue | NodeUnionValue | RelationshipValue;
  entityModel: NodeModel | AbstractNodeModel | NodeInterfaceModel | RelationshipModel | null;
  data: Record<string, any>;
  mutationType: "create" | "update";
}) => {
  const { entityModel: model, data, entityValue, mutationType } = args;

  const setStages: QueryStage<any, any, any>[] = [];
  const propertySubqueryStages: QueryStage<any, any, any>[] = [];
  const relationSubqueryStages: QueryStage<any, any, any>[] = [];

  if (!model) {
    throw new Error("Mutation of untyped node not supported yet!");
  }

  Object.values(model.properties).forEach(propertyModel => {
    const providedData = data[propertyModel.key];

    const providedValue: Value | undefined =
      providedData !== undefined ? parameterize(providedData, propertyModel.type) : undefined;

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
      const autoGenValue = parameterize(autogenInfo.autogenValue, propertyModel.type);

      value = autogenInfo.canOverride
        ? providedValue !== undefined
          ? providedValue
          : autoGenValue
        : autoGenValue;
    } else {
      value = providedValue;
    }

    if (value) {
      setStages.push($setProperty(entityValue, propertyModel.name, value));
      // todo property validation
    }
  });

  if (model.kind === "node") {
    Object.values(model.relations).forEach(relationModel => {
      const provided = castArray(data[relationModel.key]);

      provided.forEach(providedItem => {
        if (providedItem === "auto") return;

        if (providedItem instanceof RelationOperation) {
          relationSubqueryStages.push(
            ...RelationOperation.getStages(providedItem, {
              entityValue,
              relationModel,
            }),
          );
        } else {
          throw new Error("Unsupported mutation operation"); // todo better error message
        }
      });
    });
  }

  let mutationQuery = subquery(entityValue);

  setStages.forEach(stage => {
    mutationQuery = mutationQuery.pipe(() => stage);
  });

  propertySubqueryStages.forEach(stage => {
    mutationQuery = mutationQuery.pipe(() => stage);
  });

  relationSubqueryStages.forEach(stage => {
    mutationQuery = mutationQuery.pipe(() => stage);
  });

  return mergeIntoQueryStage(mutationQuery);
};
