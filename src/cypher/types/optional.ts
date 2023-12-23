import { Value } from "@core/value";
import { ObjectQueryData, QueryData } from "@core";
import type { QueryDataOutput } from "@core/utils";
import { QueryDataInput } from "@core/utils";
import {
  getDebugName,
  parseValue,
  serializeValue,
  setTypeInfo,
  Type,
  TypeOf,
} from "@core/type";

export class Optional<T extends Value> extends Value<
  QueryDataInput<T> | null,
  QueryDataOutput<T> | null
> {
  private declare _typeInfo_optional: T;

  constructor(private _innerType: Type) {
    super();
  }

  static of<T extends Value>(ofType: TypeOf<T>): TypeOf<Optional<T>> {
    const optionalClass = class extends Optional<T> {
      constructor() {
        super(ofType);
      }
    };

    setTypeInfo<QueryDataInput<T> | null, QueryDataOutput<T> | null>(optionalClass, {
      parseValue: val => (val === null ? null : parseValue(val, ofType)),
      serialize: val => (val === null ? null : serializeValue(val, ofType)),
      debugName: `Optional<${getDebugName(ofType)}>`,
    });

    return optionalClass;
  }

  static getInnerType(value: Optional<any>): Type {
    return value._innerType;
  }
}

export const optional = Optional.of;

/*
  UTILITIES
 */

/**
 *  Recursively makes each element of a QueryData optional
 */
export type DeepMakeOptional<T extends QueryData> = T extends Optional<any>
  ? T
  : T extends Value
  ? Optional<T>
  : T extends ObjectQueryData
  ? { [K in keyof T]: DeepMakeOptional<T[K]> }
  : T extends [infer TValueA extends Value]
  ? [DeepMakeOptional<TValueA>]
  : T extends [infer TValueA extends Value, infer TValueB extends Value]
  ? [DeepMakeOptional<TValueA>, DeepMakeOptional<TValueB>]
  : T extends [
      infer TValueA extends Value,
      infer TValueB extends Value,
      infer TValueC extends Value,
    ]
  ? [DeepMakeOptional<TValueA>, DeepMakeOptional<TValueB>, DeepMakeOptional<TValueC>]
  : void;

/**
 *  Forces the given type to be non-optional
 */
export type UnwrapOptional<T extends Value> = T extends Optional<infer X extends Value>
  ? X
  : T;
