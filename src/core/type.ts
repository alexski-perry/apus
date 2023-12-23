import { Neo4jParamValue, Neo4jValue } from "@core/neo4j-value";
import { ConstructorOf } from "@utils/ConstructorOf";
import { Value } from "@core/value";

export type Type = ConstructorOf<Value>;
export type TypeOf<T extends Value> = ConstructorOf<T>;

type TypeInfo<TOutput> = {
  parseValue: (data: Neo4jValue) => TOutput | undefined; // undefined represents failed parsing
  serialize: (value: any) => Neo4jParamValue | undefined; // undefined represents failed serialization
  debugName: string;
};

const TYPE_CONFIG_KEY = Symbol("TYPE_CONFIG");

export const setTypeInfo = <TInput, TOutput>(
  type: TypeOf<Value<TInput, TOutput>>,
  config: TypeInfo<TOutput>,
) => {
  // @ts-expect-error
  type[TYPE_CONFIG_KEY] = config;
};

const getTypeInfo = (type: Type): TypeInfo<any> => {
  // @ts-expect-error
  const info = type[TYPE_CONFIG_KEY];
  if (!info) throw new Error(`Failed to get type information for class '${type.name}'`);
  return info;
};

export const getDebugName = (type: Type): string => {
  return getTypeInfo(type).debugName;

  // if (typeof valueConstructor === "function") ;
  // if (Array.isArray(valueConstructor)) {
  //   const parts: string[] = [];
  //   valueConstructor.forEach(item => {
  //     parts.push(getDebugName(item));
  //   });
  //   return `[${parts.join(", ")}]`;
  // }
  // if (typeof valueConstructor === "object") {
  //   const parts: string[] = [];
  //   Object.entries(valueConstructor).forEach(([key, item]) => {
  //     parts.push(`${key}: ${getDebugName(item)}`);
  //   });
  //   return `{ ${parts.join(", ")} }`;
  // }
};

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
  // if (typeof type === "function") {
  //   const parsedValue = getTypeInfo(type).parseValue(value);
  //   if (parsedValue !== undefined) return parsedValue;
  // }
  //
  // if (Array.isArray(type) && Array.isArray(value)) {
  //   const output: any[] = [];
  //   type.forEach((valueConstructor, i) => {
  //     output[i] = parseValue(value[i]!, valueConstructor);
  //   });
  //   return output;
  // }
  //
  // if (typeof type === "object") {
  //   const output: Record<string, any> = {};
  //   Object.entries(type).forEach(([key, valueConstructor]) => {
  //     output[key] = parseValue((value as any)[key], valueConstructor);
  //   });
  //   return output;
  // }
  //
  // console.error({ failedParseValue: value });
  // throw new Error(`Failed parsing value of type '${getDebugName(type)}' (see logging above)`);
};

/**
 *  Serialize a value from a given `QueryDataConstructor`
 */
export const serializeValue = (value: any, type: Type): Neo4jParamValue | undefined => {
  const result = getTypeInfo(type).serialize(value);
  if (result === undefined) {
    console.error({ failedSerializationValue: value });
    throw new Error(
      `Failed serializing value of type '${getDebugName(type)}' (see logging above)`,
    );
  }

  return result;

  // if (typeof type === "function") return getTypeInfo(type).serialize(value);
  //
  // if (Array.isArray(type)) {
  //   const output: any[] = [];
  //   type.forEach((valueConstructor, i) => {
  //     output[i] = serializeValue(value[i], valueConstructor);
  //   });
  //   return output;
  // }
  //
  // if (typeof type === "object") {
  //   const output: Record<string, any> = {};
  //   Object.entries(type).forEach(([key, valueConstructor]) => {
  //     output[key] = serializeValue(value[key], valueConstructor);
  //   });
  //   return output;
  // }
  //
  // console.error({ failedSerializationValue: value });
  // throw new Error(
  //   `Failed serializing value of type '${getDebugName(type)}' (see logging above)`,
  // );
};
