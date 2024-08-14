import { Neo4jSerializableValue, Neo4jValue } from "@core/neo4j-value";
import { Value } from "@core/value";
import { Type, TypeOf } from "@core/type/type";

type TypeInfo<TOutput> = {
  parseValue: (data: Neo4jValue) => TOutput | undefined; // undefined represents failed parsing
  serialize: (value: any) => Neo4jSerializableValue | undefined; // undefined represents failed serialization
  debugName: string;
};

const TYPE_INFO_KEY = Symbol("TYPE_INFO");

export const setTypeInfo = <TInput, TOutput>(
  type: TypeOf<Value<any, TInput, TOutput>>,
  config: TypeInfo<TOutput>,
) => {
  // @ts-expect-error
  type[TYPE_INFO_KEY] = config;
};

export const getTypeInfo = (type: Type): TypeInfo<any> => {
  // @ts-expect-error
  const info = type[TYPE_INFO_KEY];
  if (!info) throw new Error(`Failed to get type information for class '${type.name}'`);
  return info;
};

export const getDebugName = (type: Type): string => {
  return getTypeInfo(type).debugName;
};
