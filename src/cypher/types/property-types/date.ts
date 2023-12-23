import { TemporalValue } from "./temporal";
import { isValidDate } from "@utils/isValidDate";
import { Date as Neo4jDate } from "neo4j-driver";
import { setTypeInfo } from "@core/type";

// todo configure whether to use 'number' or 'Integer', by  merging with global interface
export class Date extends TemporalValue<
  globalThis.Date | Neo4jDate<number>,
  Neo4jDate<number>
> {
  private declare _discriminator: "date";
}

setTypeInfo(Date, {
  parseValue: value => {
    if (value instanceof Neo4jDate) return value;
  },
  serialize: value => {
    if (isValidDate(value)) return Neo4jDate.fromStandardDate(value);
    if (value instanceof Neo4jDate) return value;
  },
  debugName: "Date",
});
