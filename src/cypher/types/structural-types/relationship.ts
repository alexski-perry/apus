import { StructuralValue } from "./structural";
import { Property, RelationshipDefinition } from "@schema/index";
import { ConstructorOf } from "@utils/ConstructorOf";
import { getRelationshipName, loadRelationshipModel } from "@schema/models";
import { Relationship } from "neo4j-driver";
import { setTypeInfo } from "@core/type";
import { anyProp } from "cypher/expression";

export abstract class RelationshipValue extends StructuralValue<Relationship> {
  private declare _structuralType: "relationship";

  protected constructor(private _definition: ConstructorOf<RelationshipDefinition> | string) {
    super();
  }

  static of(
    definition: ConstructorOf<RelationshipDefinition> | string,
  ): ConstructorOf<RelationshipValue> {
    let relationshipClass: ConstructorOf<RelationshipValue>;

    if (typeof definition === "string") {
      relationshipClass = class extends UntypedRelationship {
        constructor() {
          super(definition as string);
        }
      };
    } else {
      relationshipClass = class extends TypedRelationship {
        constructor() {
          super(definition as ConstructorOf<RelationshipDefinition>);
        }
      };
    }

    setTypeInfo<void, Relationship>(relationshipClass, {
      parseValue: val => {
        if (!(val instanceof Relationship)) return undefined;
        return val;
      },
      serialize: () => {
        throw new Error("Can't serialize relationships");
      },
      debugName:
        typeof definition === "string"
          ? `UntypedRelationship`
          : `GraphRelationship<${getRelationshipName(definition)}>`,
    });

    return relationshipClass;
  }

  static getDefinition(relationship: RelationshipValue) {
    return relationship._definition;
  }
}

export class TypedRelationship extends RelationshipValue {
  protected constructor(
    private _typedRelationshipDefinition: ConstructorOf<RelationshipDefinition>,
  ) {
    super(_typedRelationshipDefinition);
  }

  protected _wrap() {
    const model = loadRelationshipModel(this._typedRelationshipDefinition);
    const value: TypedRelationship = this;

    return new Proxy(value, {
      get(target, key: string) {
        if (model.properties.hasOwnProperty(key)) {
          const propertyModel = model.properties[key]!;
          return anyProp(
            value as unknown as UntypedRelationship,
            propertyModel.name,
            propertyModel.type,
          );
        }
        return (target as any)[key];
      },
    });
  }
}

export class UntypedRelationship extends RelationshipValue {
  private declare _discriminator: "untyped-relationship";
  protected constructor(name: string) {
    super(name);
  }
}

export type GraphRelationship<T extends RelationshipDefinition> = RelationshipValue & {
  [K in keyof T as KeyMapper<K, T[K]>]: RelationshipField<T[K]>;
};

type KeyMapper<K, T extends any> = T extends Property<any> ? K : never;

type RelationshipField<T extends any> = T extends Property<infer TProperty>
  ? TProperty["type"]
  : never;
