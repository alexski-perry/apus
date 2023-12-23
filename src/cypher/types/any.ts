import { Value } from "@core/value";
import { setTypeInfo } from "@core/type";
import { parseNeo4jValue, serializeNeo4jValue } from "@core/neo4j-value";

export class Any extends Value {}

setTypeInfo(Any, {
  parseValue: parseNeo4jValue,
  serialize: serializeNeo4jValue,
  debugName: "Any",
});
