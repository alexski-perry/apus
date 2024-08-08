// todo reimplement pick

/**
 *  Property access for an untyped node
 */
// export const pick = <
//   T extends NodeLikeDefinitionInstance,
//   TKeys extends Array<PropertyNames<T>>,
// >(
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
