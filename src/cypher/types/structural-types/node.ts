import { StructuralValue } from "./structural";
import { NodeLikeDefinition, Property, Relation } from "@schema/index";
import { ConstructorOf } from "@utils/ConstructorOf";
import { loadNodeLikeModel } from "@schema/models/load";
import { RelationPattern } from "../../pattern/relation-pattern";
import { Node } from "neo4j-driver";
import { setTypeInfo } from "@core/type";
import { getNodeLabels } from "@schema/models";
import { anyProp } from "cypher/expression";
import { Value } from "@core";

export abstract class NodeValue extends StructuralValue<Node & { idProperty: string }> {
  private declare _structuralType: "node";

  protected constructor(private _definition: ConstructorOf<NodeLikeDefinition> | string) {
    super();
  }

  static of(definition: ConstructorOf<NodeLikeDefinition> | string): ConstructorOf<NodeValue> {
    let nodeClass: ConstructorOf<NodeValue>;

    if (typeof definition === "string") {
      nodeClass = class extends UntypedNode {
        constructor() {
          super(definition as string);
        }
      };
    } else {
      nodeClass = class extends TypedNode {
        constructor() {
          super(definition as ConstructorOf<NodeLikeDefinition>);
        }
      };
    }

    setTypeInfo<void, Node & { idProperty: string }>(nodeClass, {
      parseValue: val => {
        if (!(val instanceof Node)) return undefined;
        return Object.assign(val, {
          idProperty: val.properties["id"],
        });
      },
      serialize: () => {
        throw new Error("Can't serialize nodes");
      },
      debugName:
        typeof definition === "string"
          ? `UntypedNode`
          : `GraphNode<${getNodeLabels(definition).join("|")}>`,
    });

    return nodeClass;
  }

  static getDefinition(node: NodeValue) {
    return node._definition;
  }
}

export class TypedNode extends NodeValue {
  protected constructor(private _typedNodeDefinition: ConstructorOf<NodeLikeDefinition>) {
    super(_typedNodeDefinition);
  }

  protected _wrap(): Value {
    const model = loadNodeLikeModel(this._typedNodeDefinition);
    const value: TypedNode = this;
    return new Proxy(value, {
      get(target, key: string) {
        if (Object.keys(model.properties).includes(key)) {
          const propertyModel = model.properties[key]!;
          return anyProp(
            value as unknown as UntypedNode,
            propertyModel.name,
            propertyModel.type,
          );
        }
        if (Object.keys(model.relations).includes(key)) {
          const relationModel = model.relations[key]!;
          return new RelationPattern(value, relationModel);
        }
        return (target as Record<string, any>)[key];
      },
    });
  }
}

export class UntypedNode extends NodeValue {
  private declare _discriminator: "untyped-node";
  protected constructor(label: string) {
    super(label);
  }
}

// The 'wrapped' version of TypedNode
export type GraphNode<T extends NodeLikeDefinition> = TypedNode & {
  [K in keyof T as FilterGraphNodeKey<K, T[K]>]: GraphNodeField<T[K]>;
};

type FilterGraphNodeKey<K, T extends any> = T extends Property<any>
  ? K
  : T extends Relation<any>
  ? K
  : never;

type GraphNodeField<T> = T extends Property<infer TProperty>
  ? TProperty["type"]
  : T extends Relation<infer TRelation>
  ? RelationPattern<TRelation["to"], TRelation["relationship"], TRelation["cardinality"]>
  : never;
