import { ConstructorOf } from "@utils/ConstructorOf";
import { GetValueInputType, GetValueOutputType, Value } from "@core/value";
import { Neo4jValue } from "@core/neo4j-value";
import { parseValue, serializeValue, TypeOf } from "@core/type/type";
import { getDebugName, setTypeInfo } from "@core/type/type-info";

export class List<T extends Value> extends Value<
  ["List", T],
  Array<GetValueInputType<T>>,
  Array<GetValueOutputType<T>>
> {
  constructor(private _innerType: ConstructorOf<Value>) {
    super();
  }

  static makeType<T extends Value>(innerType: TypeOf<T>): TypeOf<List<T>> {
    const type = class extends List<T> {
      constructor() {
        super(innerType);
      }
    };

    setTypeInfo<Array<GetValueInputType<T>>, Array<GetValueOutputType<T>>>(type, {
      parseValue: (val: Neo4jValue) => {
        if (!Array.isArray(val)) return undefined;
        const parsed: any[] = [];
        for (let i = 0; i < val.length; i++) {
          const item = val[i];
          if (!item) return undefined;
          const parsedItem = parseValue(item, innerType);
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
          const serializedItem = serializeValue(item, innerType);
          if (!serializedItem) return undefined;
          serialized.push(serializedItem);
        }
        return serialized;
      },
      debugName: `List<${getDebugName(innerType)}>`,
    });

    return type;
  }

  static getInnerType(list: List<any>): ConstructorOf<Value> {
    return list._innerType;
  }
}

// todo move to index file
export const list = List.makeType;
