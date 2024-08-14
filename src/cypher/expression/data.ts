import { Neo4jSerializableValue } from "@core/neo4j-value";
import {
  Boolean,
  String,
  Float,
  List,
  Map,
  DateTime,
  LocalTime,
  Time,
  LocalDateTime,
  Date,
  Int,
  Optional,
} from "neo4j-querier";
import {
  DateTime as Neo4jDateTime,
  Date as Neo4jDate,
  LocalDateTime as Neo4jLocalDateTime,
  LocalTime as Neo4jLocalTime,
  Time as Neo4jTime,
  Integer,
} from "neo4j-driver";
import { parameterize } from "@core/parameterize";
import { Type } from "@core/type/type";

export function data<T extends Neo4jSerializableValue>(data: T): ValueFromData<T> {
  const typeFromData = (data: Neo4jSerializableValue): Type => {
    if (typeof data === "boolean") return Boolean;
    if (typeof data === "string") return String;
    if (typeof data === "number") return Float;
    if (data instanceof Integer) return Int;
    if (data instanceof Neo4jDateTime) return DateTime;
    if (data instanceof Neo4jDate) return Date;
    if (data instanceof Neo4jTime) return Time;
    if (data instanceof Neo4jLocalDateTime) return LocalDateTime;
    if (data instanceof Neo4jLocalTime) return LocalTime;
    if (Array.isArray(data)) {
      if (data.length === 0) throw new Error("can't infer type from empty array");
      return List.makeType(typeFromData(data[0]!));
    }
    if (typeof data === "object") {
      const structure: Record<string, Type> = {};
      Object.entries(data as any).forEach(([key, val]) => {
        structure[key] = typeFromData(val as any);
      });
      return Map.makeType(structure);
    }
    throw new Error("couldn't make type");
  };

  // @ts-expect-error
  return parameterize(data, typeFromData(data));
}

/*
  INTERNAL
 */

type ValueFromData<T extends Neo4jSerializableValue> = null extends T
  ? Optional<ValueFromDataHelper<T>>
  : ValueFromDataHelper<T>;

type ValueFromDataHelper<T extends Neo4jSerializableValue> = T extends boolean
  ? Boolean
  : T extends string
    ? String
    : T extends boolean
      ? Boolean
      : T extends number
        ? Float
        : T extends Integer
          ? Int
          : T extends Neo4jDateTime
            ? DateTime
            : T extends Neo4jDate
              ? Date
              : T extends Neo4jTime
                ? Time
                : T extends Neo4jLocalDateTime
                  ? LocalDateTime
                  : T extends Neo4jLocalTime
                    ? LocalTime
                    : T extends Record<string, Neo4jSerializableValue>
                      ? Map<{ [K in keyof T]: ValueFromData<T[K]> }>
                      : T extends Array<infer T extends Neo4jSerializableValue>
                        ? List<ValueFromData<T>>
                        : never;
