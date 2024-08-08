import { LocalDateTime as Neo4jLocalDateTime } from "neo4j-driver-core";
import { isValidDate } from "@utils/isValidDate";
import { setTypeInfo } from "@core/type/type-info";
import { ScalarValue } from "@cypher/types/scalar";

export class LocalDateTime extends ScalarValue<
  "LocalDateTime",
  Date | Neo4jLocalDateTime<number>,
  Neo4jLocalDateTime<number>
> {}

setTypeInfo(LocalDateTime, {
  parseValue: value => {
    if (!(value instanceof Neo4jLocalDateTime)) return undefined;
    return value;
  },
  serialize: value => {
    if (isValidDate(value)) return Neo4jLocalDateTime.fromStandardDate(value);
    if (value instanceof Neo4jLocalDateTime) return value;
  },
  debugName: "LocalDateTime",
});
