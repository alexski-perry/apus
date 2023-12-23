import { ConstructorOf } from "@utils/ConstructorOf";
import { Value } from "@core/value";
import { QueryDataOutput, QueryDataInput } from "@core/utils/query-data";
import { Neo4jValue } from "@core/neo4j-value";
import { getDebugName, parseValue, serializeValue, setTypeInfo, Type } from "@core/type";
import { isPureObject } from "@utils/isPureObject";
import { Id } from "@utils/Id";
import { stringifyObject } from "@utils/stringifyObject";

export class Map<T extends Record<string, Value>> extends Value<
  MapInputType<T>,
  MapOutputType<T>
> {
  private declare _typeInfo_list: T;

  constructor(private _type: Record<string, ConstructorOf<Value>>) {
    super();
  }

  static of<T extends Record<string, Value>>(
    ofType: Record<string, ConstructorOf<Value>>,
  ): ConstructorOf<Map<T>> {
    const mapClass = class extends Map<T> {
      constructor() {
        super(ofType);
      }
    };

    setTypeInfo<MapInputType<T>, MapOutputType<T>>(mapClass, {
      parseValue: (val: Neo4jValue) => {
        if (!isPureObject(val)) return undefined;
        const valObject: Record<string, any> = val as any;

        const parsed: Record<string, any> = {};

        Object.entries(ofType).forEach(([key, type]) => {
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

        Object.entries(ofType).forEach(([key, type]) => {
          const keyVal = valObject[key];
          const serializedItem = serializeValue(keyVal, type);
          if (!serializedItem) return undefined;
          serialized[key] = serializedItem;
        });

        return serialized;
      },
      debugName: `Map<${stringifyObject(
        ofType,
        val => typeof val === "function",
        (val: Type) => getDebugName(val),
      )}>`,
    });

    return mapClass;
  }

  static getType(map: Map<any>) {
    return map._type;
  }
}

type MapInputType<T extends Record<string, Value>> = Id<{
  [K in keyof T]: QueryDataInput<T[K]>;
}>;

type MapOutputType<T extends Record<string, Value>> = Id<{
  [K in keyof T]: QueryDataOutput<T[K]>;
}>;
