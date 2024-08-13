import { DateTime as Neo4jDateTime } from "neo4j-driver";
import { isValidDate } from "@utils/isValidDate";
import { setTypeInfo } from "@core/type/type-info";
import { ScalarValue } from "@cypher/types/scalar";

export class DateTime extends ScalarValue<"DateTime", Date | Neo4jDateTime<number>, Date> {}

setTypeInfo(DateTime, {
  parseValue: value => {
    if (value instanceof Neo4jDateTime) {
      return value.toStandardDate();
    }
  },
  serialize: value => {
    if (isValidDate(value)) return Neo4jDateTime.fromStandardDate(value);
    if (value instanceof Neo4jDateTime) return value;
  },
  debugName: "DateTime",
});
