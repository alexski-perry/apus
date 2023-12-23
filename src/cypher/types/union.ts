import { Value } from "@core/value";
import { QueryData } from "@core";
import { QueryDataInput, QueryDataOutput } from "@core/utils";
import { setTypeInfo } from "@core/type";
import { parseNeo4jValue, serializeNeo4jValue } from "@core/neo4j-value";

// todo keep track of possible union members and reflect in parsing/serialization
export class Union<T extends QueryData> extends Value<QueryDataInput<T>, QueryDataOutput<T>> {
  private declare _typeInfo_union: T;
}

setTypeInfo(Union, {
  debugName: "Union",
  parseValue: parseNeo4jValue,
  serialize: serializeNeo4jValue,
});
