import { StructuralValue } from "./structural";
import { NodeUnionDefinition } from "@schema/index";
import { ConstructorOf } from "@utils/ConstructorOf";
import { setTypeInfo } from "@core/type";
import { Node } from "neo4j-driver";
import { getNodeLabels } from "@schema/models";

export class NodeUnionValue extends StructuralValue<Node & { idProperty: string }> {
  private declare _discriminator: "node-union";

  protected constructor(private _definition: ConstructorOf<NodeUnionDefinition>) {
    super();
  }

  static of(definition: ConstructorOf<NodeUnionDefinition>): ConstructorOf<NodeUnionValue> {
    const unionClass = class extends NodeUnionValue {
      constructor() {
        super(definition);
      }
    };

    setTypeInfo<void, Node & { idProperty: string }>(unionClass, {
      parseValue: val => {
        if (!(val instanceof Node)) return undefined;
        return Object.assign(val, {
          idProperty: val.properties["id"],
        });
      },
      serialize: () => {
        throw new Error("Can't serialize node unions");
      },
      debugName: `NodeUnion<${getNodeLabels(definition).join("|")}>`,
    });

    return unionClass;
  }

  static getDefinition(node: NodeUnionValue) {
    return node._definition;
  }
}

export declare class GraphNodeUnion<T extends NodeUnionDefinition> extends NodeUnionValue {
  private _subtypes: T;
}
