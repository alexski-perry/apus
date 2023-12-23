import { TemporalValue } from "./temporal";
import { DateTime as Neo4jDateTime } from "neo4j-driver";
import { setTypeInfo } from "@core/type";
import { isValidDate } from "@utils/isValidDate";

export class DateTime extends TemporalValue<
  Date | Neo4jDateTime<number>,
  Neo4jDateTime<number>
> {
  private declare _discriminator: "date-time";
}

setTypeInfo(DateTime, {
  parseValue: value => {
    if (!(value instanceof Neo4jDateTime)) return undefined;
    return value;
  },
  serialize: value => {
    if (isValidDate(value)) return Neo4jDateTime.fromStandardDate(value);
    if (value instanceof Neo4jDateTime) return value;
  },
  debugName: "DateTime",
});
