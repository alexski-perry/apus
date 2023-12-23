import {
  Definition,
  NodeLikeDefinition,
  NodeLikeOrUnionDefinition,
  NodeUnionDefinition,
} from "../index";
import { Relation } from "../index";
import { constructorOf, ConstructorOf } from "@utils/ConstructorOf";
import { Property } from "../index";
import {
  AbstractNodeModel,
  EntityModel,
  NodeInterfaceModel,
  NodeLikeModel,
  NodeModel,
  NodeUnionModel,
  RelationshipModel,
} from "./types";
import { arrayEquals } from "@utils/arrayEquals";
import { getExpectedSubtypes } from "../subtypes-cache";

const cache = new WeakMap<ConstructorOf<Definition<any>>, EntityModel>();

const subtypesCache = new WeakMap<ConstructorOf<Definition<any>>, NodeLikeModel["subtypes"]>();

const supertypeCache = new WeakMap<
  ConstructorOf<Definition<any>>,
  NodeLikeModel["supertype"]
>();

export const loadNodeModel = (def: ConstructorOf<Definition<"node">>) =>
  load(def) as NodeModel;

export const loadConcreteNodeModel = (def: ConstructorOf<"node" | "abstract-node">) =>
  load(def) as NodeModel | AbstractNodeModel;

export const loadNodeLikeModel = (def: ConstructorOf<NodeLikeDefinition>) =>
  load(def) as NodeModel | AbstractNodeModel | NodeInterfaceModel;

export const loadNodeLikeOrUnionModel = (def: ConstructorOf<NodeLikeOrUnionDefinition>) =>
  load(def) as NodeModel | AbstractNodeModel | NodeInterfaceModel | NodeUnionModel;

export const loadRelationshipModel = (def: ConstructorOf<Definition<"relationship">>) =>
  load(def) as RelationshipModel;

export const getSuperType = (model: NodeLikeModel): NodeLikeModel["supertype"] => {
  const { definition } = model;
  const definitionConstructor = constructorOf(definition);

  if (supertypeCache.has(definitionConstructor)) {
    return supertypeCache.get(definitionConstructor)!;
  }

  const superclassConstructor = Object.getPrototypeOf(
    Object.getPrototypeOf(definitionConstructor),
  );

  if (superclassConstructor && superclassConstructor !== {}.constructor) {
    const supertype = load(superclassConstructor);

    if (
      supertype &&
      (supertype.kind === "node" ||
        supertype.kind === "abstract-node" ||
        supertype.kind === "node-interface")
    ) {
      supertypeCache.set(definitionConstructor, supertype);
      return supertype;
    }
  }

  supertypeCache.set(definitionConstructor, null);
  return null;
};

export const getSubtypes = (model: NodeLikeModel): NodeLikeModel["subtypes"] => {
  const { definition } = model;
  const definitionConstructor = constructorOf(definition);

  if (subtypesCache.has(definitionConstructor)) {
    return subtypesCache.get(definitionConstructor)!;
  }

  const subtypesFieldValue: any = (definition as any)["$subtypes"];
  const supertypeSubtypes = getSuperType(model) ? getSubtypes(getSuperType(model)!) : {};

  const areSubtypesInherited = arrayEquals(
    Object.keys(supertypeSubtypes),
    Object.keys(subtypesFieldValue ?? {}),
  );

  const subtypeModels: Record<string, NodeLikeModel> = {};

  if (!areSubtypesInherited) {
    if (typeof subtypesFieldValue !== "object")
      throw new Error(`Invalid $subtypes definition on '${model.debugName}'`);

    Object.entries(subtypesFieldValue).forEach(([key, value]) => {
      if (typeof value !== "function") {
        throw new Error(`Invalid $subtypes definition on '${model.debugName}'`);
      }

      subtypeModels[key] = load(value as ConstructorOf<Definition<any>>) as
        | NodeModel
        | AbstractNodeModel
        | NodeInterfaceModel;
    });
  }

  subtypesCache.set(definitionConstructor, subtypeModels);
  return subtypeModels;
};

// todo custom exception type
const load = (constructor: ConstructorOf<any>): EntityModel | null => {
  if (cache.has(constructor)) {
    return cache.get(constructor) ?? null;
  }

  const className = constructor.name;
  const instantiated: Record<string, any> = new (constructor as any)();

  const name = instantiated["$name"];
  const kind = instantiated["$kind"];

  if (typeof kind !== "string") return null;

  const model = initialize({ kind, instantiated, name, className });
  cache.set(constructor, model);

  if (
    model.kind === "node" ||
    model.kind === "abstract-node" ||
    model.kind === "node-interface"
  ) {
    model.supertype = getSuperType(model);

    const subtypes = getSubtypes(model);
    model.subtypes = subtypes;

    // check subtypes match expected
    if (subtypes) {
      const expectedSubtypes = getExpectedSubtypes(constructor);
      const subtypesList = Object.values(subtypes);

      expectedSubtypes.forEach(({ cons: expectedSubtypeAnonymousClassCons, identifier }) => {
        const hasSubtype = subtypesList.some(subtype => {
          const cons = constructorOf(subtype.definition);
          const parentCons = Object.getPrototypeOf(cons); // the anonymous class created by Node()/AbstractNode()...
          return parentCons === expectedSubtypeAnonymousClassCons;
        });

        if (!hasSubtype) {
          throw new Error(`'${model.debugName}' is missing a subtype: '${identifier}'`);
        }
      });
    }

    // check subtypes have supertype
    Object.values(subtypes).forEach(subtype => {
      if (getSuperType(subtype) !== model) {
        throw new Error(
          `'${subtype.debugName}' is not a valid subtype of '${model.debugName}'`,
        );
      }
    });
  }

  // add properties and relations
  Object.entries(instantiated).forEach(([key, val]) => {
    if (
      model.kind === "node" ||
      model.kind === "relationship" ||
      model.kind === "abstract-node" ||
      model.kind === "node-interface"
    ) {
      if (val instanceof Property) {
        const def = Property.getDefinition(val);
        model.properties[key] = {
          key,
          isOwn: !(
            "supertype" in model &&
            model.supertype &&
            key in model.supertype.properties
          ),
          name: def.overrideName ?? key,
          type: def.type,
          creationStrategy: def.creationStrategy,
          updateStrategy: def.updateStrategy,
          validate: def.validate,
        };
      }
    }

    if (
      model.kind === "node" ||
      model.kind === "node-interface" ||
      model.kind === "abstract-node"
    ) {
      if ("supertype" in model && model.supertype && key in model.relations) return;

      if (val instanceof Relation) {
        const def = Relation.getDefinition(val);
        model.relations[key] = {
          key,
          isOwn: !(
            "supertype" in model &&
            model.supertype &&
            key in model.supertype.relations
          ),
          cardinality: def.cardinality,
          direction: def.direction,
          deletionStrategy: def.deletionStrategy,
          relationship: loadRelationshipModel(def.relationship),
          to: load(def.to) as Exclude<EntityModel, RelationshipModel>,
        };
      }
    }
  });

  return model;
};

const initialize = (args: {
  kind: string;
  instantiated: Record<string, any>;
  name: string | undefined;
  className: string;
}): EntityModel => {
  const { kind, instantiated, name, className } = args;

  if (kind === "node") {
    if (!name) throw new Error(`Node label not defined for class '${className}'`);
    return {
      kind: "node",
      debugName: name === className ? name : `${name}[${className}]`,
      supertype: null,
      subtypes: {},
      label: name,
      properties: {},
      relations: {},
      definition: instantiated as Definition<"node">,
    } satisfies NodeModel;
  } else if (kind === "relationship") {
    if (!name) throw new Error(`Relationship name not defined for class '${className}'`);
    return {
      kind: "relationship",
      debugName: name === className ? name : `${name}[${className}]`,
      name,
      properties: {},
      definition: instantiated as Definition<"relationship">,
    } satisfies RelationshipModel;
  } else if (kind === "node-interface") {
    return {
      kind: "node-interface",
      debugName: `[${className}]`,
      supertype: null,
      subtypes: {},
      properties: {},
      relations: {},
      definition: instantiated as Definition<"node-interface">,
    } satisfies NodeInterfaceModel;
  } else if (kind === "abstract-node") {
    if (!name) throw new Error(`AbstractNode label not defined for class '${className}'`);
    return {
      kind: "abstract-node",
      debugName: name === className ? name : `${name}[${className}]`,
      label: name,
      supertype: null,
      subtypes: {},
      properties: {},
      relations: {},
      definition: instantiated as Definition<"abstract-node">,
    } satisfies AbstractNodeModel;
  } else if (kind === "node-union") {
    return {
      kind: "node-union",
      debugName: `[${className}]`,
      subtypes: {},
      definition: instantiated as Definition<"node-union">,
    } satisfies NodeUnionModel;
  } else {
    throw new Error(`unsupported entity '${kind}'`);
  }
};
