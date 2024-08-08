import { Time as Neo4jTime } from "neo4j-driver";
import { isValidDate } from "@utils/isValidDate";
import { setTypeInfo } from "@core/type/type-info";
import { ScalarValue } from "@cypher/types/scalar";

export class Time extends ScalarValue<"Time", Date | Neo4jTime<number>, Neo4jTime<number>> {}

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
