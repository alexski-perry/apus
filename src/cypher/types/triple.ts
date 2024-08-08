import { ConstructorOf } from "@utils/ConstructorOf";
import { GetValueInputType, GetValueOutputType, Value } from "@core/value";
import { Neo4jValue } from "@core/neo4j-value";
import { parseValue, serializeValue, TypeOf } from "@core/type/type";
import { getDebugName, setTypeInfo } from "@core/type/type-info";

export class Triple<T1 extends Value, T2 extends Value, T3 extends Value> extends Value<
  ["Triple", T1, T2, T3],
  [GetValueInputType<T1>, GetValueInputType<T2>, GetValueInputType<T3>],
  [GetValueOutputType<T1>, GetValueOutputType<T2>, GetValueOutputType<T3>]
> {
  constructor(
    private _firstType: ConstructorOf<Value>,
    private _secondType: ConstructorOf<Value>,
    private _thirdType: ConstructorOf<Value>,
  ) {
    super();
  }

  static makeType<T1 extends Value, T2 extends Value, T3 extends Value>(
    firstType: TypeOf<T1>,
    secondType: TypeOf<T2>,
    thirdType: TypeOf<T3>,
  ): TypeOf<Triple<T1, T2, T3>> {
    const type = class extends Triple<T1, T2, T3> {
      constructor() {
        super(firstType, secondType, thirdType);
      }
    };

    setTypeInfo<
      [GetValueInputType<T1>, GetValueInputType<T2>, GetValueInputType<T3>],
      [GetValueOutputType<T1>, GetValueOutputType<T2>, GetValueOutputType<T3>]
    >(type, {
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

    return type;
  }

  static getTypes(triple: Triple<any, any, any>) {
    return {
      first: triple._firstType,
      second: triple._secondType,
      third: triple._thirdType,
    };
  }
}
