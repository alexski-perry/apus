import {
  AbstractNodeModel,
  AbstractRelationshipModel,
  EntityModel,
  NodeModel,
  NodeUnionModel,
  RelationshipModel,
  RelationshipUnionModel,
} from "./model";
import {
  AbstractNodeDefinition,
  AbstractNodeDefinitionClass,
  AbstractRelationshipDefinitionClass,
  EntityDefinition,
  EntityDefinitionClass,
  NodeDefinition,
  NodeDefinitionClass,
  NodeTemplateDefinitionClass,
  NodeUnionDefinition,
  NodeUnionDefinitionClass,
  RelationshipDefinitionClass,
  RelationshipTemplateDefinitionClass,
  RelationshipUnionDefinitionClass,
} from "@schema/definition";
import { loadModel } from "@schema/loadModel";
import { ConstructorOf } from "@utils/ConstructorOf";
import { Deconstruct } from "@utils/deconstruct";

export const getModelDebugName = (model: EntityModel): string => {
  return model.definitionInstance.constructor.name;
};

export function getNodeLabelsForMatching(
  model:
    | string
    | NodeDefinitionClass
    | AbstractNodeDefinitionClass
    | NodeUnionDefinitionClass
    | NodeModel
    | AbstractNodeModel
    | NodeUnionModel,
): string[] {
  if (typeof model === "string") return [model];
  if (typeof model === "function") return getNodeLabelsForMatching(loadModel(model));

  if (model.kind === "Node") {
    return [model.label];
  } else if (model.kind === "AbstractNode") {
    if (model.passedOnLabels.length) {
      return model.passedOnLabels;
    } else {
      return model.subtypes.flatMap(getNodeLabelsForMatching);
    }
  } else {
    return model.subtypes.flatMap(getNodeLabelsForMatching);
  }
}

export function getNodeLabelsForCreating(
  model: string | NodeDefinitionClass | NodeModel,
): string[] {
  if (typeof model === "string") return [model];
  if (typeof model === "function") return getNodeLabelsForCreating(loadModel(model));

  function recursivelyGetLabels(model: NodeModel | AbstractNodeModel) {
    const labels: string[] = [];
    if (model.kind === "Node") {
      labels.push(model.label, ...model.additionalLabels);
    } else if (model.kind === "AbstractNode") {
      labels.push(...model.passedOnLabels);
    }
    if (model.supertype) {
      labels.push(...recursivelyGetLabels(model.supertype));
    }
    return labels;
  }

  return recursivelyGetLabels(model);
}

export function getRelationshipName(
  model: string | RelationshipDefinitionClass | RelationshipModel,
): string {
  if (typeof model === "string") return model;
  if (typeof model === "function") return getRelationshipName(loadModel(model));

  return model.name;
}

export function getConcreteRelationshipNames(
  model:
    | string
    | RelationshipDefinitionClass
    | AbstractRelationshipDefinitionClass
    | RelationshipUnionDefinitionClass
    | RelationshipModel
    | AbstractRelationshipModel
    | RelationshipUnionModel,
): string[] {
  if (typeof model === "string") return [model];
  if (typeof model === "function") return getConcreteRelationshipNames(loadModel(model));

  return model.kind === "Relationship"
    ? [model.name]
    : model.subtypes.flatMap(getConcreteRelationshipNames);
}

export type ModelFromDefinition<T extends EntityDefinitionClass> =
  T extends NodeDefinitionClass
    ? NodeModel
    : T extends AbstractNodeDefinitionClass
      ? AbstractNodeModel
      : T extends NodeUnionDefinitionClass
        ? NodeUnionModel
        : T extends RelationshipDefinitionClass
          ? RelationshipModel
          : T extends AbstractRelationshipDefinitionClass
            ? AbstractRelationshipModel
            : T extends RelationshipUnionDefinitionClass
              ? RelationshipUnionModel
              : T extends NodeTemplateDefinitionClass | RelationshipTemplateDefinitionClass
                ? null
                : never;

export function maybeLoadModel<TDefinition extends string | EntityDefinitionClass>(
  def: TDefinition,
): TDefinition extends EntityDefinitionClass ? ModelFromDefinition<TDefinition> : null {
  return typeof def === "string"
    ? null
    : (loadModel(def as ConstructorOf<NodeDefinition>) as any);
}

export type FilterDefinition<T> = T extends EntityDefinition ? T : never;

export type DefinitionFromClass<T extends EntityDefinitionClass | string> = T extends string
  ? string
  : T extends EntityDefinitionClass
    ? Deconstruct<T>
    : never;

export type GetSubtypesField<
  T extends NodeDefinition | AbstractNodeDefinition | NodeUnionDefinition,
> = undefined extends T["$"]["subtypes"]
  ? []
  : T["$"]["subtypes"] extends Array<NodeDefinitionClass | AbstractNodeDefinitionClass>
    ? T["$"]["subtypes"]
    : never;

export type NodeOrConcreteSubtypes<
  T extends NodeDefinition | AbstractNodeDefinition | NodeUnionDefinition,
> =
  | (T extends NodeDefinition | AbstractNodeDefinition | NodeUnionDefinition ? T : never)
  | GetNodeConcreteSubtypes<GetSubtypesField<T>, []>[number];

export type GetNodeConcreteSubtypes<
  T extends Array<NodeDefinitionClass | AbstractNodeDefinitionClass>,
  TAcc extends Array<NodeDefinition>,
> = T extends [
  infer THead extends NodeDefinitionClass | AbstractNodeDefinitionClass,
  ...infer TTail extends Array<NodeDefinitionClass | AbstractNodeDefinitionClass>,
]
  ? GetNodeConcreteSubtypes<TTail, JoinSubtypes<THead, TAcc>>
  : TAcc;

export type JoinSubtypes<
  THead extends NodeDefinitionClass | AbstractNodeDefinitionClass,
  TAcc extends Array<NodeDefinition>,
> = [
  ...(THead extends NodeDefinitionClass
    ? [
        Deconstruct<THead>,
        ...GetNodeConcreteSubtypes<GetSubtypesField<Deconstruct<THead>>, []>,
      ]
    : THead extends AbstractNodeDefinitionClass
      ? GetNodeConcreteSubtypes<GetSubtypesField<Deconstruct<THead>>, []>
      : never),
  ...TAcc,
];

export const getNodeConcreteSubtypes = (
  input:
    | NodeDefinitionClass
    | AbstractNodeDefinitionClass
    | NodeUnionDefinitionClass
    | NodeModel
    | AbstractNodeModel
    | NodeUnionModel,
): NodeModel[] => {
  const model = typeof input === "function" ? loadModel(input) : input;
  if (model.kind === "Node" || model.kind === "AbstractNode") {
    return Object.values(model.subtypes).flatMap(getNodeConcreteSubtypes);
  } else {
    return Object.values(model.subtypes).flatMap(getNodeConcreteSubtypes);
  }
};
