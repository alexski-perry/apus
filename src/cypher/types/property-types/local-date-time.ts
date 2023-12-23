import { TemporalValue } from "./temporal";
import { LocalDateTime as Neo4jLocalDateTime } from "neo4j-driver-core";
import { setTypeInfo } from "@core/type";
import { isValidDate } from "@utils/isValidDate";

export class LocalDateTime extends TemporalValue<
  Date | Neo4jLocalDateTime<number>,
  Neo4jLocalDateTime<number>
> {
  private declare _discriminator: "local-date-time";
}

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
