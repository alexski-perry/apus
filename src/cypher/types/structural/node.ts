import { RelationPattern } from "../../pattern/relation-pattern";
import { Node as Neo4jNode } from "neo4j-driver";
import { Value } from "@core/value";
import { setTypeInfo } from "@core/type/type-info";
import { loadModel } from "@schema/loadModel";
import { propUnsafe } from "@cypher/expression/prop";
import {
  AbstractNodeDefinition,
  AbstractNodeDefinitionClass,
  NodeDefinition,
  NodeDefinitionClass,
  NodeUnionDefinition,
  NodeUnionDefinitionClass,
  PropertyDefinition,
  RelationDefinition,
} from "@schema/definition";
import { TypeOf } from "@core/type/type";

export abstract class NodeValue extends Value<"Node", never, Neo4jNode> {
  protected constructor(
    private _definition:
      | string
      | NodeDefinitionClass
      | AbstractNodeDefinitionClass
      | NodeUnionDefinitionClass,
  ) {
    super();
  }

  protected _wrap(): NodeValue {
    if (typeof this._definition === "string") {
      return this;
    }

    const model = loadModel(this._definition);
    if (model.kind === "NodeUnion") return this;

    const _this = this as Record<string, any>;

    for (const key in model.properties) {
      const property = model.properties[key]!;
      _this[key] = propUnsafe(this, property.name, property.type);
    }

    for (const key in model.relations) {
      const relationModel = model.relations[key]!;
      _this[key] = new RelationPattern(this, relationModel);
    }

    return _this as any;

    // todo remove old proxy stuff
    // note: important we pass the proxy into 'propUnsafe', so that it gets used
    // as an expression dependency
    // const proxy = new Proxy(this, {
    //   get(target, key: string) {
    //     if (key in model.properties) {
    //       const property = model.properties[key]!;
    //       return propUnsafe(proxy, property.name, property.type);
    //     }
    //     if (key in model.relations) {
    //       const relationModel = model.relations[key]!;
    //       return new RelationPattern(proxy, relationModel);
    //     }
    //     return (target as any)[key];
    //   },
    // });
    // return proxy;
  }

  static makeType(
    definition:
      | string
      | NodeDefinitionClass
      | AbstractNodeDefinitionClass
      | NodeUnionDefinitionClass,
  ): TypeOf<NodeValue> {
    const type = class extends NodeValue {
      constructor() {
        super(definition);
      }
    };

    setTypeInfo<void, Neo4jNode>(type, {
      parseValue: val => {
        if (!(val instanceof Neo4jNode)) return undefined;
        return val;
      },
      serialize: () => {
        throw new Error("Can't serialize nodes");
      },
      debugName:
        typeof definition === "string" ? `UntypedNode` : `GraphNode<${definition.name}>`,
    });

    return type;
  }

  static getDefinition(node: NodeValue) {
    return node._definition;
  }
}

export type Node<
  T extends string | NodeDefinition | AbstractNodeDefinition | NodeUnionDefinition =
    | string
    | NodeDefinition
    | AbstractNodeDefinition
    | NodeUnionDefinition,
> = NodeValue & {
  [K in keyof T as FilterGraphNodeKey<K, T[K]>]: GraphNodeField<T[K]>;
};

// UTILITY TYPES

export type TypedNode = Node<NodeDefinition | AbstractNodeDefinition | NodeUnionDefinition>;

export type ExtractNodeDefinition<T extends Node> = T extends Node<infer TNodeDef>
  ? TNodeDef
  : never;

// INTERNAL TYPES

type FilterGraphNodeKey<K, T extends any> = T extends PropertyDefinition<any>
  ? K
  : T extends RelationDefinition<any>
    ? K
    : never;

type GraphNodeField<T> = T extends PropertyDefinition<infer TProperty>
  ? TProperty["type"]
  : T extends RelationDefinition<infer TRelation>
    ? RelationPattern<TRelation["to"], TRelation["relationship"], TRelation["cardinality"]>
    : never;
