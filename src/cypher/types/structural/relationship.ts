import { Relationship as Neo4jRelationship } from "neo4j-driver";
import { Value } from "@core/value";
import { loadModel } from "@schema/loadModel";
import { propUnsafe } from "@cypher/expression/prop";
import {
  AbstractRelationshipDefinitionClass,
  AbstractRelationshipDefinition,
  PropertyDefinition,
  RelationshipDefinitionClass,
  RelationshipDefinition,
  RelationshipUnionDefinitionClass,
  RelationshipUnionDefinition,
} from "@schema/definition";
import { setTypeInfo } from "@core/type/type-info";
import { TypeOf } from "@core/type/type";

export abstract class RelationshipValue extends Value<
  "Relationship",
  never,
  Neo4jRelationship
> {
  constructor(
    private _definition:
      | string
      | RelationshipDefinitionClass
      | AbstractRelationshipDefinitionClass
      | RelationshipUnionDefinitionClass,
  ) {
    super();
  }

  protected _wrap(): RelationshipValue {
    if (typeof this._definition === "string") {
      return this;
    }

    const model = loadModel(this._definition);
    if (model.kind === "RelationshipUnion") return this;

    // note: important we pass the proxy into 'propUnsafe', so that it gets used
    // as an expression dependency
    const proxy = new Proxy(this, {
      get(target, key: string) {
        if (key in model.properties) {
          const property = model.properties[key]!;
          return propUnsafe(proxy, property.name, property.type);
        }
        return (target as any)[key];
      },
    });

    return proxy;
  }

  static makeType(
    definition:
      | string
      | RelationshipDefinitionClass
      | AbstractRelationshipDefinitionClass
      | RelationshipUnionDefinitionClass,
  ): TypeOf<RelationshipValue> {
    const type = class extends RelationshipValue {
      constructor() {
        super(definition);
      }
    };

    setTypeInfo<void, Neo4jRelationship>(type, {
      parseValue: val => {
        if (!(val instanceof Neo4jRelationship)) return undefined;
        return val;
      },
      serialize: () => {
        throw new Error("Can't serialize relationships");
      },
      debugName:
        typeof definition === "string"
          ? `UntypedRelationship`
          : `GraphRelationship<${definition.name}>`,
    });

    return type;
  }

  static getDefinition(relationship: RelationshipValue) {
    return relationship._definition;
  }
}

export type Relationship<
  T extends
    | string
    | RelationshipDefinition
    | AbstractRelationshipDefinition
    | RelationshipUnionDefinition =
    | string
    | RelationshipDefinition
    | AbstractRelationshipDefinition
    | RelationshipUnionDefinition,
> = RelationshipValue & {
  [K in keyof T as KeyMapper<K, T[K]>]: RelationshipField<T[K]>;
};

// INTERNAL TYPES

type KeyMapper<K, T extends any> = T extends PropertyDefinition<any> ? K : never;

type RelationshipField<T extends any> = T extends PropertyDefinition<infer TProperty>
  ? TProperty["type"]
  : never;
