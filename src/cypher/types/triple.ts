import { ConstructorOf } from "@utils/ConstructorOf";
import { Value } from "@core/value";
import { QueryDataOutput, QueryDataInput } from "@core/utils/query-data";
import { Neo4jValue } from "@core/neo4j-value";
import { getDebugName, parseValue, serializeValue, setTypeInfo } from "@core/type";

export class Triple<T1 extends Value, T2 extends Value, T3 extends Value> extends Value<
  [QueryDataInput<T1>, QueryDataInput<T2>, QueryDataInput<T3>],
  [QueryDataOutput<T1>, QueryDataOutput<T2>, QueryDataOutput<T3>]
> {
  private declare _typeInfo_triple: [T1, T2, T3];

  constructor(
    private _firstType: ConstructorOf<Value>,
    private _secondType: ConstructorOf<Value>,
    private _thirdType: ConstructorOf<Value>,
  ) {
    super();
  }

  static of<T1 extends Value, T2 extends Value, T3 extends Value>(
    firstType: ConstructorOf<T1>,
    secondType: ConstructorOf<T2>,
    thirdType: ConstructorOf<T3>,
  ): ConstructorOf<Triple<T1, T2, T3>> {
    const tripleClass = class extends Triple<T1, T2, T3> {
      constructor() {
        super(firstType, secondType, thirdType);
      }
    };

    setTypeInfo<
      [QueryDataInput<T1>, QueryDataInput<T2>, QueryDataInput<T3>],
      [QueryDataOutput<T1>, QueryDataOutput<T2>, QueryDataOutput<T3>]
    >(tripleClass, {
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

        const item3 = val[2];
        if (!item3) return undefined;
        const parsedItem3 = parseValue(item3, secondType);
        if (!parsedItem3) return undefined;

        return [parsedItem1, parsedItem2, parsedItem3];
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

        const item3 = val[2];
        if (!item3) return undefined;
        const serializedItem3 = serializeValue(item3, secondType);
        if (!serializedItem3) return undefined;

        return [serializedItem1, serializedItem2, serializedItem3];
      },
      debugName: `Triple<${getDebugName(firstType)}, ${getDebugName(
        secondType,
      )}, ${getDebugName(thirdType)}>`,
    });

    return tripleClass;
  }

  static getTypes(triple: Triple<any, any, any>) {
    return {
      first: triple._firstType,
      second: triple._secondType,
      third: triple._thirdType,
    };
  }
}
