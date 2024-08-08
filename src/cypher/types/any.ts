import { Value } from "@core/value";
import { parseNeo4jValue, serializeNeo4jValue } from "@core/neo4j-value";
import { setTypeInfo } from "@core/type/type-info";

export class Any extends Value<"Any"> {}

setTypeInfo(Any, {
  parseValue: parseNeo4jValue,
  serialize: serializeNeo4jValue,
  debugName: "Any",
});
