import { GetValueInputType, Value } from "@core/value";
import { Neo4jValue } from "@core/neo4j-value";
import { parseValue, serializeValue, Type, TypeOf } from "@core/type/type";
import { isPureObject } from "@utils/isPureObject";
import { Id } from "@utils/Id";
import { stringifyObject } from "@utils/stringifyObject";
import { GetQueryDataOutputType } from "@core/query-data";
import { getDebugName, setTypeInfo } from "@core/type/type-info";

export class Map<
  TStructure extends Record<string, Value> = Record<string, Value>,
> extends Value<["Map", TStructure], MapInputType<TStructure>, MapOutputType<TStructure>> {
  constructor(private _structure: Record<string, Type>) {
    super();
  }

  static makeType<T extends Record<string, Value>>(
    structure: Record<string, Type>,
  ): TypeOf<Map<T>> {
    const type = class extends Map<T> {
      constructor() {
        super(structure);
      }
    };

    setTypeInfo<MapInputType<T>, MapOutputType<T>>(type, {
      parseValue: (val: Neo4jValue) => {
        if (!isPureObject(val)) return undefined;
        const valObject: Record<string, any> = val as any;

        const parsed: Record<string, any> = {};

        Object.entries(structure).forEach(([key, type]) => {
          const keyVal = valObject[key];
          const parsedItem = parseValue(keyVal, type);
          if (!parsedItem) return undefined;
          parsed[key] = parsedItem;
        });

        return parsed as MapOutputType<T>;
      },
      serialize: val => {
        if (!isPureObject(val)) return undefined;
        const valObject: Record<string, any> = val as any;

        const serialized: Record<string, any> = {};

        Object.entries(structure).forEach(([key, type]) => {
          const keyVal = valObject[key];
          const serializedItem = serializeValue(keyVal, type);
          if (!serializedItem) return undefined;
          serialized[key] = serializedItem;
        });

        return serialized;
      },
      debugName: `Map<${stringifyObject(
        structure,
        val => typeof val === "function",
        (val: Type) => getDebugName(val),
      )}>`,
    });

    return type;
  }

  static getStructure(map: Map<any>) {
    return map._structure;
  }
}

// INTERNAL TYPES

type MapInputType<T extends Record<string, Value>> = Id<{
  [K in keyof T]: GetValueInputType<T[K]>;
}>;

type MapOutputType<T extends Record<string, Value>> = Id<{
  [K in keyof T]: GetQueryDataOutputType<T[K]>;
}>;
