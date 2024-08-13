import { Time as Neo4jTime } from "neo4j-driver";
import { isValidDate } from "@utils/isValidDate";
import { setTypeInfo } from "@core/type/type-info";
import { ScalarValue } from "@cypher/types/scalar";

export class Time extends ScalarValue<
  "Time",
  Date | Neo4jTime<number>,
  {
    hour: number;
    minute: number;
    second: number;
    nanosecond: number;
    timeZoneOffsetSeconds: number;
  }
> {}

setTypeInfo(Time, {
  parseValue: value => {
    if (value instanceof Neo4jTime) {
      return {
        hour: value.hour,
        minute: value.minute,
        second: value.second,
        nanosecond: value.nanosecond,
        timeZoneOffsetSeconds: value.timeZoneOffsetSeconds,
      };
    }
  },
  serialize: value => {
    if (isValidDate(value)) return Neo4jTime.fromStandardDate(value);
    if (value instanceof Neo4jTime) return value;
  },
  debugName: "Time",
});
