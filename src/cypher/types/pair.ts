import { ConstructorOf } from "@utils/ConstructorOf";
import { Value } from "@core/value";
import { QueryDataOutput, QueryDataInput } from "@core/utils/query-data";
import { Neo4jValue } from "@core/neo4j-value";
import { getDebugName, parseValue, serializeValue, setTypeInfo } from "@core/type";

export class Pair<T1 extends Value, T2 extends Value> extends Value<
  [QueryDataInput<T1>, QueryDataInput<T2>],
  [QueryDataOutput<T1>, QueryDataOutput<T2>]
> {
  private declare _typeInfo_pair: [T1, T2];

  constructor(
    private _firstType: ConstructorOf<Value>,
    private _secondType: ConstructorOf<Value>,
  ) {
    super();
  }

  static of<T1 extends Value, T2 extends Value>(
    firstType: ConstructorOf<T1>,
    secondType: ConstructorOf<T2>,
  ): ConstructorOf<Pair<T1, T2>> {
    const pairClass = class extends Pair<T1, T2> {
      constructor() {
        super(firstType, secondType);
      }
    };

    setTypeInfo<
      [QueryDataInput<T1>, QueryDataInput<T2>],
      [QueryDataOutput<T1>, QueryDataOutput<T2>]
    >(pairClass, {
      parseValue: (val: Neo4jValue) => {
        if (!Array.isArray(val)) return undefined;

        const item1 = val[0];
        if (!item1) return undefined;
        const parsedItem1 = parseValue(item1, firstType);
        if (!parsedItem1) return undefined;

        const item2 = val[1];
        if (!item2) return undefined;
        const parsedItem2 = parseValue(item2, secondType);
        if (!parsedItem2) return undefined;

        return [parsedItem1, parsedItem2];
      },
      serialize: val => {
        if (!Array.isArray(val)) return undefined;

        const item1 = val[0];
        if (!item1) return undefined;
        const serializedItem1 = serializeValue(item1, firstType);
        if (!serializedItem1) return undefined;

        const item2 = val[1];
        if (!item2) return undefined;
        const serializedItem2 = serializeValue(item2, secondType);
        if (!serializedItem2) return undefined;

        return [serializedItem1, serializedItem2];
      },
      debugName: `Pair<${getDebugName(firstType)}, ${getDebugName(secondType)}>`,
    });

    return pairClass;
  }

  static getTypes(pair: Pair<any, any>) {
    return {
      first: pair._firstType,
      second: pair._secondType,
    };
  }
}
