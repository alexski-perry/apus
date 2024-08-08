import { ConstructorOf } from "@utils/ConstructorOf";
import { ValueInfo } from "@core/value-info";

export abstract class Value<TTag = any, TInputType = any, TOutputType = any> {
  private declare _typeMeta: [TTag, TInputType, TOutputType];

  private _info: ValueInfo | null = null;
  private _dependencies: Set<Value> = new Set<Value>();

  protected _wrap(): Value {
    return this;
  }

  static create<T extends Value>(
    type: ConstructorOf<T>,
    data: ValueInfo,
    dependencies?: Set<Value> | "self",
  ): T {
    const value = new (type as new () => T)();
    value._info = data;
    if (dependencies === "self") {
      value._dependencies.add(value)
    } else if (dependencies) {
      value._dependencies = dependencies;
    }
    return value._wrap() as T;
  }

  static createRaw(data: ValueInfo): Value {
    const value = new (data.type as new () => Value)();
    value._info = data;
    return value._wrap();
  }

  static getValueInfo(value: Value) {
    if (!value._info) {
      throw new Error(
        "Attempted to call 'getValueInfo' on a value that has not been created correctly",
      );
    }
    return value._info;
  }

  static getDependencies(value: Value) {
    return value._dependencies;
  }

  static clone(value: Value) {
    const valueData = Value.getValueInfo(value);
    return Value.create(valueData.type, valueData);
  }
}

/**
 * Extracts the input type from a Value
 */
export type GetValueInputType<T extends Value> = T extends Value<any, infer X> ? X : never;

/**
 * Extracts the output type from a Value
 */
export type GetValueOutputType<T extends Value> = T extends Value<any, any, infer X>
  ? X
  : never;

/**
 *  Helper type to represent a value or the literal value it represents
 */
export type ValueOrInputType<T extends Value> = T | GetValueInputType<T>;
