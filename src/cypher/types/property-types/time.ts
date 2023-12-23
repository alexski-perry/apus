import { TemporalValue } from "./temporal";
import { Time as Neo4jTime } from "neo4j-driver";
import { setTypeInfo } from "@core/type";
import { isValidDate } from "@utils/isValidDate";

export class Time extends TemporalValue<Date | Neo4jTime<number>, Neo4jTime<number>> {
  private declare _discriminator: "time";
}

setTypeInfo(Time, {
  parseValue: value => {
    if (!(value instanceof Neo4jTime)) return undefined;
    return value;
  },
  serialize: value => {
    if (isValidDate(value)) return Neo4jTime.fromStandardDate(value);
    if (value instanceof Neo4jTime) return value;
  },
  debugName: "Time",
});
