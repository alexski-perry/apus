import { Relationship, RelationshipValue } from "@cypher/types/structural/relationship";
import { Node, NodeValue } from "@cypher/types/structural/node";
import { Map } from "@cypher/types/map";
import {
  AbstractNodeDefinition,
  AbstractRelationshipDefinition,
  NodeDefinition,
  PropertyDefinition,
  RelationshipDefinition,
} from "@schema/definition";
import { expression } from "@core/expression";
import { loadModel } from "@schema/loadModel";
import { TypeOf } from "@core/type/type";
import { Any } from "@cypher/types/any";
import { Value } from "@core/value";
import { getModelDebugName } from "@schema/utils";
import { Optional } from "@cypher/types/optional";

/**
 *  Property access for a strongly typed node, relationship or map
 */
// todo support optionals???
export function prop<
  T extends
    | Node<NodeDefinition | AbstractNodeDefinition>
    | Relationship<RelationshipDefinition | AbstractRelationshipDefinition>
    | Map,
  K extends AllowedProperties<T>,
>(value: T, key: K): PropertyType<T, K> {
  if (value instanceof NodeValue) {
    const nodeDefinition = NodeValue.getDefinition(value);
    if (typeof nodeDefinition === "string") {
      throw new Error("Cannot call prop() on untyped node");
    }

    const nodeModel = loadModel(nodeDefinition);
    if (nodeModel.kind === "NodeUnion") {
      throw new Error("Cannot call prop() on node union");
    }

    const propertyModel = nodeModel.properties[key];
    if (!propertyModel) {
      throw new Error(
        `Property '${key}' doesn't exist on '${nodeModel.definitionInstance.constructor.name}'`,
      );
    }

    return expression(propertyModel.type)`${value}.${key}` as PropertyType<T, K>;
  }

  if (value instanceof RelationshipValue) {
    const relationshipDefinition = RelationshipValue.getDefinition(value);
    if (typeof relationshipDefinition === "string") {
      throw new Error("Cannot call prop() on untyped relationship");
    }

    const relationshipModel = loadModel(relationshipDefinition);
    if (relationshipModel.kind === "RelationshipUnion") {
      throw new Error("Cannot call prop() on relationship union");
    }

    const propertyModel = relationshipModel.properties[key];
    if (!propertyModel) {
      throw new Error(
        `Property '${key}' doesn't exist on '${getModelDebugName(relationshipModel)}'`,
      );
    }

    return expression(propertyModel.type)`${value}.${key}` as PropertyType<T, K>;
  }

  if (value instanceof Map) {
    const mapStructure = Map.getStructure(value);
    const type = mapStructure[key];
    if (!type) {
      throw new Error(
        `Property '${key}' doesn't exist on map with keys '${Object.keys(mapStructure).join(
          ", ",
        )}'`,
      );
    }
    return expression(type)`${value}.${key}` as PropertyType<T, K>;
  }

  throw new Error("Unsupported value passed to prop()");
}

export function propUnsafe<T extends Value = Any>(
  value: Node | Relationship | Map | Optional<Node | Relationship | Map>,
  key: string,
  // @ts-expect-error
  type: TypeOf<T> = Any,
) {
  return expression(type)`${value}.${key}`;
}

// INTERNAL HELPERS

type AllowedProperties<T extends Node | Relationship | Map> = T extends Node<infer TNodeDef>
  ? TNodeDef extends NodeDefinition | AbstractNodeDefinition
    ? keyof TypedNodeProperties<TNodeDef>
    : never
  : T extends Relationship<infer TRelationshipDef>
    ? TRelationshipDef extends RelationshipDefinition | AbstractRelationshipDefinition
      ? keyof TypedRelationshipProperties<TRelationshipDef>
      : never
    : T extends Map<infer TMapStructure>
      ? keyof TMapStructure
      : never;

type PropertyType<T extends Node | Relationship | Map, K extends string> = T extends Node<
  infer TNodeDef
>
  ? TNodeDef extends NodeDefinition | AbstractNodeDefinition
    ? K extends keyof TypedNodeProperties<TNodeDef>
      ? TypedNodeProperties<TNodeDef>[K]
      : never
    : never
  : T extends Relationship<infer TRelationshipDef>
    ? TRelationshipDef extends RelationshipDefinition | AbstractRelationshipDefinition
      ? K extends keyof TypedRelationshipProperties<TRelationshipDef>
        ? TypedRelationshipProperties<TRelationshipDef>[K]
        : never
      : never
    : T extends Map<infer TMapStructure>
      ? K extends keyof TMapStructure
        ? TMapStructure[K]
        : never
      : never;

type TypedNodeProperties<T extends NodeDefinition | AbstractNodeDefinition> = {
  [K in keyof T as PropertyKeyFilter<T, K>]: T[K] extends PropertyDefinition<infer TProperty>
    ? TProperty["type"]
    : never;
};

type TypedRelationshipProperties<
  T extends RelationshipDefinition | AbstractRelationshipDefinition,
> = {
  [K in keyof T as PropertyKeyFilter<T, K>]: T[K] extends PropertyDefinition<infer TProperty>
    ? TProperty["type"]
    : never;
};

type PropertyKeyFilter<T, K extends keyof T> = T[K] extends PropertyDefinition<any>
  ? K
  : never;
