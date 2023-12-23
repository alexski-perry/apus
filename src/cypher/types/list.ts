import { ConstructorOf } from "@utils/ConstructorOf";
import { Value } from "@core/value";
import { QueryDataOutput, QueryDataInput } from "@core/utils/query-data";
import { Neo4jValue } from "@core/neo4j-value";
import { getDebugName, parseValue, serializeValue, setTypeInfo } from "@core/type";
import { PropertyValue } from "@cypher/types/property-types/property";
import { Optional } from "@cypher/types/optional";

export class List<T extends Value> extends Value<
  Array<QueryDataInput<T>>,
  Array<QueryDataOutput<T>>
> {
  private declare _typeInfo_list: T;

  constructor(private _innerType: ConstructorOf<Value>) {
    super();
  }

  static of<T extends Value>(ofType: ConstructorOf<T>): ConstructorOf<List<T>> {
    if (!ofType) throw new Error("Attempt to create list from nothing");

    const listClass = class extends List<T> {
      constructor() {
        super(ofType);
      }
    };

    setTypeInfo<Array<QueryDataInput<T>>, Array<QueryDataOutput<T>>>(listClass, {
      parseValue: (val: Neo4jValue) => {
        if (!Array.isArray(val)) return undefined;
        const parsed: any[] = [];
        for (let i = 0; i < val.length; i++) {
          const item = val[i];
          if (!item) return undefined;
          const parsedItem = parseValue(item, ofType);
          if (!parsedItem) return undefined;
          parsed.push(parsedItem);
        }
        return parsed;
      },
      serialize: val => {
        if (!Array.isArray(val)) return undefined;
        const serialized: any[] = [];
        for (let i = 0; i < val.length; i++) {
          const item = val[i];
          if (!item) return undefined;
          const serializedItem = serializeValue(item, ofType);
          if (!serializedItem) return undefined;
          serialized.push(serializedItem);
        }
        return serialized;
      },
      debugName: `List<${getDebugName(ofType)}>`,
    });

    return listClass;
  }

  static getInnerType(list: List<any>): ConstructorOf<Value> {
    return list._innerType;
  }
}

export const list = <T extends PropertyValue | Optional<PropertyValue>>(
  innerType: ConstructorOf<T>,
): ConstructorOf<List<T>> => List.of(innerType as any);
