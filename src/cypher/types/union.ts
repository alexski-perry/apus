import { GetValueInputType, GetValueOutputType, Value } from "@core/value";
import { parseNeo4jValue, serializeNeo4jValue } from "@core/neo4j-value";
import { setTypeInfo } from "@core/type/type-info";

// todo keep track of possible union members and reflect in parsing/serialization
export class Union<T extends Value> extends Value<
  ["Union", T],
  GetValueInputType<T>,
  GetValueOutputType<T>
> {}

setTypeInfo(Union, {
  debugName: "Union",
  parseValue: parseNeo4jValue,
  serialize: serializeNeo4jValue,
});
