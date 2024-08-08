import { GetValueInputType, GetValueOutputType, Value } from "@core/value";
import { parseValue, serializeValue, Type, TypeOf } from "@core/type/type";
import { getDebugName, setTypeInfo } from "@core/type/type-info";

export class Optional<T extends Value> extends Value<
  ["Optional", T],
  GetValueInputType<T> | null,
  GetValueOutputType<T> | null
> {
  constructor(private _innerType: Type) {
    super();
  }

  static makeType<T extends Value>(innerType: TypeOf<T>): TypeOf<Optional<T>> {
    // todo handle optional inner types?

    const type = class extends Optional<T> {
      constructor() {
        super(innerType);
      }
    };

    setTypeInfo<GetValueInputType<T> | null, GetValueOutputType<T> | null>(type, {
      parseValue: val => (val === null ? null : parseValue(val, innerType)),
      serialize: val => (val === null ? null : serializeValue(val, innerType)),
      debugName: `Optional<${getDebugName(innerType)}>`,
    });

    return type;
  }

  static getInnerType(value: Optional<any>): Type {
    return value._innerType;
  }
}

export const optional = Optional.makeType;

// UTILITY TYPES

export type MakeOptional<T extends Value> = T extends Optional<any> ? T : T;

/**
 *  Forces the given type to be non-optional
 */
export type UnwrapOptional<T extends Value> = T extends Optional<infer X extends Value>
  ? X
  : T;
