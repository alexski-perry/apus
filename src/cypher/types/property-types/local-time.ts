import { TemporalValue } from "./temporal";
import { LocalTime as Neo4jLocalTime } from "neo4j-driver-core";
import { setTypeInfo } from "@core/type";
import { isValidDate } from "@utils/isValidDate";

export class LocalTime extends TemporalValue<
  Date | Neo4jLocalTime<number>,
  Neo4jLocalTime<number>
> {
  private declare _discriminator: "local-time";
}

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
