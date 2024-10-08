import {
  Integer,
  Date,
  LocalDateTime,
  LocalTime,
  Time,
  DateTime,
  Duration,
  Point,
  Node,
  Relationship,
  Path,
} from "neo4j-driver";
import { isValidDate } from "@utils/isValidDate";

export type Neo4jValue =
  | boolean
  | string
  | number // float
  | Integer
  | Date<number>
  | LocalDateTime<number>
  | LocalTime<number>
  | Time<number>
  | DateTime<number>
  | Duration<number>
  | Point<number>
  | Node
  | Relationship
  | Path
  | null
  | Array<Neo4jValue>
  | {
      [key: string]: Neo4jValue;
    };

export type Neo4jSerializableValue =
  | boolean
  | string
  | number // float
  | Integer
  | globalThis.Date
  | Date<any>
  | LocalDateTime<any>
  | LocalTime<any>
  | Time<any>
  | DateTime<any>
  | null
  | Array<Neo4jSerializableValue>
  | {
      [key: string]: Neo4jSerializableValue;
    };

// used for Any type
export const parseNeo4jValue = (value: Neo4jValue): any => {
  // todo probably ought to convert dates
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
    value instanceof Duration ||
    value instanceof Node ||
    value instanceof Relationship ||
    value instanceof Path
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

  if (Array.isArray(value)) {
    const output: any[] = [];
    for (let i = 0; i < value.length; i++) {
      output[i] = parseNeo4jValue(value[i]!);
    }
    return output;
  }

  if (typeof value === "object") {
    const output: Record<string, any> = {};
    for (const [key, item] of Object.entries(value)) {
      output[key] = parseNeo4jValue(item);
    }
    return output;
  }
};

export const serializeNeo4jValue = (value: any): Neo4jSerializableValue | undefined => {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" || // numbers get serialized as floats
    typeof value === "boolean" ||
    value instanceof Date ||
    value instanceof DateTime ||
    value instanceof LocalTime ||
    value instanceof LocalDateTime ||
    value instanceof Time
  ) {
    return value;
  }

  if (isValidDate(value)) {
    // all date values get serialized as `DateTime`
    DateTime.fromStandardDate(value);
  }

  if (Array.isArray(value)) {
    const output: any[] = [];
    for (let i = 0; i < value.length; i++) {
      output[i] = serializeNeo4jValue(value[i]);
    }
    return output;
  }

  if (typeof value === "object") {
    const output: Record<string, any> = {};
    for (const [key, item] of Object.entries(value)) {
      output[key] = serializeNeo4jValue(item);
    }
    return output;
  }
};
