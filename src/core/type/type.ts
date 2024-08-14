import { Neo4jSerializableValue, Neo4jValue } from "@core/neo4j-value";
import { ConstructorOf } from "@utils/ConstructorOf";
import { Value } from "@core/value";
import { getDebugName, getTypeInfo } from "@core/type/type-info";

export type Type = ConstructorOf<Value>;
export type TypeOf<T extends Value> = ConstructorOf<T>;

/**
 *  Parse a Neo4j value from a given `QueryDataConstructor`
 */
export const parseValue = (value: Neo4jValue, type: Type): any => {
  const result = getTypeInfo(type).parseValue(value);
  if (result === undefined) {
    console.error({ failedParseValue: value });
    throw new Error(
      `Failed parsing value of type '${getDebugName(type)}' (see logging above)`,
    );
  }

  return result;
};

/**
 *  Serialize a value from a given `QueryDataConstructor`
 */
export const serializeValue = (value: any, type: Type): Neo4jSerializableValue | undefined => {
  const result = getTypeInfo(type).serialize(value);
  if (result === undefined) {
    console.error({ failedSerializationValue: value });
    throw new Error(
      `Failed serializing value of type '${getDebugName(type)}' (see logging above)`,
    );
  }

  return result;
};

/**
 *  Returns the constructor of a Value (fully typed)
 */
export const typeOf = <T extends Value>(value: T): TypeOf<T> => {
  // if (util.types.isProxy(value)) {
  //   return value.constructor.constructor as TypeOf<T>;
  // } else {
  return value.constructor as TypeOf<T>;
  // }
};
