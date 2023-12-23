import { Property } from "@schema/property";
import { NodeLikeDefinition } from "@schema/definition";
import { ConstructorOf } from "@utils/ConstructorOf";
import {
  AllowedPropertyValue,
  GraphNode,
  NodeUnionValue,
  NodeValue,
  RelationshipValue,
  UntypedNode,
  UntypedRelationship,
} from "@cypher/types";
import { Optional } from "@cypher/types";
import { loadNodeLikeModel } from "@schema/models";
import { ObjectQueryData } from "@core";
import { AnyProperty } from "@cypher/types/property-types/any-property";
import { expression } from "@cypher/expression/core";

/**
 *  Property access for an untyped node
 */
// export const pick = <T extends NodeLikeDefinition, TKeys extends Array<PropertyNames<T>>>(
//   node: GraphNode<T>,
//   ...keys: TKeys
//   //@ts-expect-error
// ): Pick<GraphNode<T>, TKeys[number]> => {
//   const propertyMap: ObjectQueryData = {};
//
//   keys.forEach(key => {
//     propertyMap[key] = prop(node, key);
//   });
//
//   return propertyMap as any;
// };
