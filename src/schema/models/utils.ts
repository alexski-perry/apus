import {
  AbstractNodeModel,
  NodeLikeOrUnionModel,
  NodeModel,
  RelationshipModel,
} from "./types";
import { ConstructorOf } from "@utils/ConstructorOf";
import { loadNodeLikeOrUnionModel, loadRelationshipModel } from "@schema/models/load";
import { NodeLikeOrUnionDefinition, RelationshipDefinition } from "@schema/definition";

export const getNodeLabels = (
  input: string | ConstructorOf<NodeLikeOrUnionDefinition> | NodeLikeOrUnionModel,
): string[] => {
  if (typeof input === "string") return [input];

  const model = typeof input === "function" ? loadNodeLikeOrUnionModel(input) : input;

  switch (model.kind) {
    case "node":
    case "abstract-node":
      return [model.label];
    case "node-interface":
    case "node-union":
      return Object.values(model.subtypes).flatMap(model => getNodeLabels(model));
  }
};

export const getNodeConcreteSubtypes = (
  input: ConstructorOf<NodeLikeOrUnionDefinition> | NodeLikeOrUnionModel,
): (NodeModel | AbstractNodeModel)[] => {
  const model = typeof input === "function" ? loadNodeLikeOrUnionModel(input) : input;
  switch (model.kind) {
    case "node":
      return [model];
    case "abstract-node":
      return [
        model,
        ...Object.values(model.subtypes).flatMap(model => getNodeConcreteSubtypes(model)),
      ];
    case "node-interface":
    case "node-union":
      return Object.values(model.subtypes).flatMap(model => getNodeConcreteSubtypes(model));
  }
};

export const getRelationshipName = (
  input: string | ConstructorOf<RelationshipDefinition> | RelationshipModel,
): string => {
  if (typeof input === "string") return input;
  const model = typeof input === "function" ? loadRelationshipModel(input) : input;
  return model.name;
};
