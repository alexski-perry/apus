import { ConstructorOf } from "@utils/ConstructorOf";
import { ValueData } from "@core/value-data";

export abstract class Value<TInputType = any, TOutputType = any> {
  private declare _typeInfo: [TInputType, TOutputType];

  // gets set by static methods
  private _data: ValueData | null = null;

  protected _wrap(): Value {
    return this;
  }

  static create<T extends Value>(type: ConstructorOf<T>, data: ValueData): T {
    const value = new (type as new () => T)();
    value._data = data;
    return value._wrap() as T;
  }

  static getValueData(value: Value) {
    if (!value._data) {
      throw new Error(
        "Attempted to call 'getValueData' on a value that has not been created correctly",
      );
    }
    return value._data;
  }
}
