import { setTypeInfo } from "@core/type";
import {
  Date,
  DateTime,
  Duration,
  Integer,
  LocalDateTime,
  LocalTime,
  Point,
  Time,
  Node,
  Path,
  Relationship,
} from "neo4j-driver";
import { isValidDate } from "@utils/isValidDate";
import { Neo4jValue, parseNeo4jValue, serializeNeo4jValue } from "@core/neo4j-value";
import { PropertyValue } from "@cypher/types";

export class AnyProperty extends PropertyValue {}

setTypeInfo(AnyProperty, {
  parseValue: value => {
    if (Array.isArray(value)) {
      const output: any[] = [];
      for (const item of value) {
        const parsed = parseNeo4jValue(item);
        if (parsed === undefined) return;
        output.push(parsed);
      }
      return output;
    }
    return parsePropertyValue(value);
  },
  serialize: value => {
    // todo ensure array is homogenous
    if (Array.isArray(value)) {
      const output: any[] = [];
      for (const item of value) {
        const parsed = serializePropertyValue(item);
        if (parsed === undefined) return;
        output.push(parsed);
      }
      return output;
    }
    return serializeNeo4jValue(value);
  },
  debugName: "AnyProperty",
});

export const parsePropertyValue = (value: Neo4jValue) => {
  if (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "string" ||
    typeof value === "number" ||
    value instanceof Date ||
    value instanceof LocalDateTime ||
    value instanceof LocalTime ||
    value instanceof DateTime ||
    value instanceof Time ||
    value instanceof Point ||
    value instanceof Duration
  ) {
    return value;
  }

  if (Integer.isInteger(value)) {
    if (!value.inSafeRange()) {
      throw new Error("Tried to parse an integer not in safe range!");
    } else {
      return value.toNumber();
    }
  }
};

export const serializePropertyValue = (value: Neo4jValue) => {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" || // numbers get serialized as floats
    typeof value === "boolean"
  ) {
    return value;
  }

  if (isValidDate(value)) {
    // all date values get serialized as `DateTime`
    DateTime.fromStandardDate(value);
  }
};
