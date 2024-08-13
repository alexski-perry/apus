import { LocalTime as Neo4jLocalTime } from "neo4j-driver-core";
import { isValidDate } from "@utils/isValidDate";
import { setTypeInfo } from "@core/type/type-info";
import { ScalarValue } from "@cypher/types/scalar";

export class LocalTime extends ScalarValue<
  "LocalTime",
  Date | Neo4jLocalTime<number>,
  {
    hour: number;
    minute: number;
    second: number;
    nanosecond: number;
  }
> {}

setTypeInfo(LocalTime, {
  parseValue: value => {
    if (value instanceof Neo4jLocalTime) {
      return {
        hour: value.hour,
        minute: value.minute,
        second: value.second,
        nanosecond: value.nanosecond,
      };
    }
  },
  serialize: value => {
    if (isValidDate(value)) return Neo4jLocalTime.fromStandardDate(value);
    if (value instanceof Neo4jLocalTime) return value;
  },
  debugName: "LocalTime",
});
