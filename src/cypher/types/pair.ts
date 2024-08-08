import { GetValueInputType, GetValueOutputType, Value } from "@core/value";
import { Neo4jValue } from "@core/neo4j-value";
import { parseValue, serializeValue, Type, TypeOf } from "@core/type/type";
import { getDebugName, setTypeInfo } from "@core/type/type-info";

export class Pair<T1 extends Value, T2 extends Value> extends Value<
  ["Pair", T1, T2],
  [GetValueInputType<T1>, GetValueInputType<T2>],
  [GetValueOutputType<T1>, GetValueOutputType<T2>]
> {
  constructor(
    private _firstType: Type,
    private _secondType: Type,
  ) {
    super();
  }

  static makeType<T1 extends Value, T2 extends Value>(
    firstType: TypeOf<T1>,
    secondType: TypeOf<T2>,
  ): TypeOf<Pair<T1, T2>> {
    const type = class extends Pair<T1, T2> {
      constructor() {
        super(firstType, secondType);
      }
    };

    setTypeInfo<
      [GetValueInputType<T1>, GetValueInputType<T2>],
      [GetValueOutputType<T1>, GetValueOutputType<T2>]
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

    return type;
  }

  static getTypes(pair: Pair<any, any>) {
    return {
      first: pair._firstType,
      second: pair._secondType,
    };
  }
}
