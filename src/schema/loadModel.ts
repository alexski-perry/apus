import {
  AbstractNodeModel,
  AbstractRelationshipModel,
  EntityModel,
  NodeModel,
  NodeUnionModel,
  RelationshipModel,
  RelationshipUnionModel,
} from "./model";
import { getModelDebugName, ModelFromDefinition } from "@schema/utils";
import {
  AbstractNodeDefinition,
  AbstractNodeDefinitionClass,
  AbstractRelationshipDefinition,
  AbstractRelationshipDefinitionClass,
  EntityDefinition,
  EntityDefinitionClass,
  isPropertyDefinition,
  isRelationDefinition,
  NodeDefinition,
  NodeDefinitionClass,
  NodeUnionDefinition,
  RelationshipDefinition,
  RelationshipUnionDefinition,
} from "@schema/definition";
import { getExpectedSubtypes } from "@schema/expected-subtypes";
import { castArray } from "@utils/castArray";

const MODEL_CACHE = new WeakMap<EntityDefinitionClass, EntityModel>();

export function isNodeLikeModel(
  model: EntityModel,
): model is NodeModel | AbstractNodeModel | NodeUnionModel {
  return model.kind === "Node" || model.kind === "AbstractNode" || model.kind === "NodeUnion";
}

export const loadModel = <TDefinition extends EntityDefinitionClass>(
  definition: TDefinition,
): ModelFromDefinition<TDefinition> => {
  if (MODEL_CACHE.has(definition))
    return MODEL_CACHE.get(definition) as ModelFromDefinition<TDefinition>;

  // @ts-expect-error
  const instance: EntityDefinition = new definition();

  if (!("$" in instance)) {
    throw new Error("Invalid entity definition — missing $ field");
  }

  if (
    instance.$.configType === "NodeTemplate" ||
    instance.$.configType === "RelationshipTemplate"
  ) {
    return null as ModelFromDefinition<TDefinition>;
  }

  const model = initializeModel(instance);

  MODEL_CACHE.set(definition, model);

  if (
    model.kind === "Node" ||
    model.kind === "AbstractNode" ||
    model.kind === "Relationship" ||
    model.kind === "AbstractRelationship"
  ) {
    model.supertype = isNodeLikeModel(model)
      ? getNodeSupertype(model)
      : getRelationshipSupertype(model);
  }

  if (
    model.kind === "Node" ||
    model.kind === "AbstractNode" ||
    model.kind === "AbstractRelationship"
  ) {
    // set subtypes
    const providedSubtypes = isNodeLikeModel(model)
      ? getNodeSubtypes(model)
      : getRelationshipSubtypes(model);

    model.subtypes = providedSubtypes;

    // check each expected subtype is present
    const expectedSubtypesList = getExpectedSubtypes(definition);
    expectedSubtypesList.forEach(expectedSubtypeAnonClass => {
      const hasSubtype = providedSubtypes.some(
        providedSubtype =>
          Object.getPrototypeOf(providedSubtype.definitionInstance.constructor) ===
          expectedSubtypeAnonClass,
      );

      if (!hasSubtype) {
        throw new Error(`'${getModelDebugName(model)}' is missing a subtype`);
      }
    });

    // check there aren't superfluous subtypes present
    providedSubtypes.forEach(subtypeModel => {
      const supertype = isNodeLikeModel(subtypeModel)
        ? getNodeSupertype(subtypeModel)
        : getRelationshipSupertype(subtypeModel);

      if (!(supertype === model)) {
        throw new Error(
          `'${getModelDebugName(model)}' has an incorrect subtype: '${getModelDebugName(
            subtypeModel,
          )}'`,
        );
      }
    });
  }

  if (model.kind === "NodeUnion") {
    (instance as NodeUnionDefinition).$.subtypes.forEach(subtype => {
      model.subtypes.push(loadModel(subtype));
    });
  }

  if (model.kind === "RelationshipUnion") {
    (instance as RelationshipUnionDefinition).$.subtypes.forEach(subtype => {
      model.subtypes.push(loadModel(subtype));
    });
  }

  // add properties and relations
  Object.entries(instance).forEach(([key, fieldValue]) => {
    if (key === "$") return;
    if (
      model.kind !== "NodeUnion" &&
      model.kind !== "RelationshipUnion" &&
      isPropertyDefinition(fieldValue)
    ) {
      model.properties[key] = {
        kind: "Property",
        key,
        name: fieldValue.overrideName ?? key,
        type: fieldValue.type,
        creationStrategy: fieldValue.creationStrategy,
        updateStrategy: fieldValue.updateStrategy,
        validate: fieldValue.validate,
      };
    } else if (
      (model.kind === "Node" || model.kind === "AbstractNode") &&
      isRelationDefinition(fieldValue)
    ) {
      model.relations[key] = {
        kind: "Relation",
        key,
        cardinality: fieldValue.cardinality,
        direction: fieldValue.direction,
        deletionStrategy: fieldValue.deletionStrategy,
        to: loadModel(fieldValue.to),
        relationship: loadModel(fieldValue.relationship),
      };
    } else {
      throw new Error(`Unsupported field value for key '${key}'`);
    }
  });

  return model as ModelFromDefinition<TDefinition>;
};

const initializeModel = (instance: EntityDefinition): EntityModel => {
  const config = instance.$;

  switch (config.configType) {
    case "Node":
      return {
        kind: "Node",
        label: config.label,
        additionalLabels: config.additionalLabels ?? [],
        supertype: null,
        subtypes: [],
        properties: {},
        relations: {},
        definitionInstance: instance as NodeDefinition,
      } satisfies NodeModel;
    case "AbstractNode":
      return {
        kind: "AbstractNode",
        identifier: config.identifier,
        passedOnLabels: !config.passOnLabel
          ? []
          : config.passOnLabel === true
            ? [config.identifier]
            : castArray(config.passOnLabel),
        supertype: null,
        subtypes: [],
        properties: {},
        relations: {},
        definitionInstance: instance as AbstractNodeDefinition,
      } satisfies AbstractNodeModel;
    case "NodeUnion":
      return {
        kind: "NodeUnion",
        subtypes: [],
        definitionInstance: instance as NodeUnionDefinition,
      } satisfies NodeUnionModel;
    case "Relationship":
      return {
        kind: "Relationship",
        name: config.name,
        supertype: null,
        properties: {},
        definitionInstance: instance as RelationshipDefinition,
      } satisfies RelationshipModel;
    case "AbstractRelationship":
      return {
        kind: "AbstractRelationship",
        identifier: config.identifier,
        supertype: null,
        subtypes: [],
        properties: {},
        definitionInstance: instance as AbstractRelationshipDefinition,
      } satisfies AbstractRelationshipModel;
    case "RelationshipUnion":
      return {
        kind: "RelationshipUnion",
        subtypes: [],
        definitionInstance: instance as RelationshipUnionDefinition,
      } satisfies RelationshipUnionModel;
  }

  throw new Error("Unable to initialize model");
};

const NODE_SUPERTYPES_CACHE = new Map<
  NodeDefinition | AbstractNodeDefinition,
  NodeModel | AbstractNodeModel | null
>();

export const getNodeSupertype = (
  model: NodeModel | AbstractNodeModel,
): NodeModel | AbstractNodeModel | null => {
  if (NODE_SUPERTYPES_CACHE.has(model.definitionInstance))
    return NODE_SUPERTYPES_CACHE.get(model.definitionInstance)!;

  const superclass: NodeDefinitionClass | AbstractNodeDefinitionClass = Object.getPrototypeOf(
    Object.getPrototypeOf(model.definitionInstance.constructor),
  );

  const result = Object.getPrototypeOf(superclass) !== null ? loadModel(superclass) : null;
  NODE_SUPERTYPES_CACHE.set(model.definitionInstance, result);
  return result;
};

const RELATIONSHIP_SUPERTYPES_CACHE = new Map<
  RelationshipDefinition | AbstractRelationshipDefinition,
  AbstractRelationshipModel | null
>();

export const getRelationshipSupertype = (
  model: RelationshipModel | AbstractRelationshipModel,
): AbstractRelationshipModel | null => {
  if (RELATIONSHIP_SUPERTYPES_CACHE.has(model.definitionInstance))
    return RELATIONSHIP_SUPERTYPES_CACHE.get(model.definitionInstance)!;

  const superclass: AbstractRelationshipDefinitionClass = Object.getPrototypeOf(
    Object.getPrototypeOf(model.definitionInstance.constructor),
  );

  const result = Object.getPrototypeOf(superclass) !== null ? loadModel(superclass) : null;
  RELATIONSHIP_SUPERTYPES_CACHE.set(model.definitionInstance, result);
  return result;
};

const NODE_SUBTYPES_CACHE = new WeakMap<
  NodeDefinition | AbstractNodeDefinition,
  Array<NodeModel | AbstractNodeModel>
>();

export const getNodeSubtypes = (
  model: NodeModel | AbstractNodeModel,
): Array<NodeModel | AbstractNodeModel> => {
  if (NODE_SUBTYPES_CACHE.has(model.definitionInstance))
    return NODE_SUBTYPES_CACHE.get(model.definitionInstance)!;

  const definedSubtypes = model.definitionInstance.$.subtypes;
  const subtypeModels: Array<NodeModel | AbstractNodeModel> = [];

  (definedSubtypes ?? []).forEach(subtype => {
    subtypeModels.push(loadModel(subtype));
  });

  NODE_SUBTYPES_CACHE.set(model.definitionInstance, subtypeModels);
  return subtypeModels;
};

const RELATIONSHIP_SUBTYPES_CACHE = new WeakMap<
  AbstractRelationshipDefinition,
  Array<RelationshipModel | AbstractRelationshipModel>
>();

export const getRelationshipSubtypes = (
  model: AbstractRelationshipModel,
): Array<RelationshipModel | AbstractRelationshipModel> => {
  if (RELATIONSHIP_SUBTYPES_CACHE.has(model.definitionInstance))
    return RELATIONSHIP_SUBTYPES_CACHE.get(model.definitionInstance)!;

  const definedSubtypes = model.definitionInstance.$.subtypes;
  const subtypeModels: Array<RelationshipModel | AbstractRelationshipModel> = [];

  (definedSubtypes ?? []).forEach(subtype => {
    subtypeModels.push(loadModel(subtype));
  });

  RELATIONSHIP_SUBTYPES_CACHE.set(model.definitionInstance, subtypeModels);
  return subtypeModels;
};
