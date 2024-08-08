import { LocalTime as Neo4jLocalTime } from "neo4j-driver-core";
import { isValidDate } from "@utils/isValidDate";
import { setTypeInfo } from "@core/type/type-info";
import { ScalarValue } from "@cypher/types/scalar";

export class LocalTime extends ScalarValue<
  "LocalTime",
  Date | Neo4jLocalTime<number>,
  Neo4jLocalTime<number>
> {}

setTypeInfo(LocalTime, {
  parseValue: value => {
    if (!(value instanceof Neo4jLocalTime)) return undefined;
    return value;
  },
  serialize: value => {
    if (isValidDate(value)) return Neo4jLocalTime.fromStandardDate(value);
    if (value instanceof Neo4jLocalTime) return value;
  },
  debugName: "LocalTime",
});
