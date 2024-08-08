import { ScalarValue } from "../scalar";
import { setTypeInfo } from "@core/type/type-info";
import { TypeOf } from "@core/type/type";

export abstract class BooleanValue<TValue extends boolean> extends ScalarValue<
  ["Boolean", TValue],
  TValue,
  TValue
> {}

export class Boolean extends BooleanValue<boolean> {}

setTypeInfo(Boolean, {
  parseValue: val => {
    if (typeof val === "boolean") return val;
  },
  serialize: val => {
    if (typeof val === "boolean") return val;
  },
  debugName: "Boolean",
});

export class BooleanLiteral<T extends boolean> extends BooleanValue<T> {
  constructor(private _allowedValue: boolean) {
    super();
  }

  static makeType<T extends boolean>(value: T): TypeOf<BooleanLiteral<T>> {
    const booleanClass = class extends BooleanLiteral<T> {
      constructor() {
        super(value);
      }
    };

    setTypeInfo(booleanClass, {
      parseValue: val => {
        if (val === value) return val;
      },
      serialize: val => {
        if (val === value) return val;
      },
      debugName: `BooleanLiteral<${value}>`,
    });

    return booleanClass;
  }

  static getAllowedValue(value: BooleanLiteral<any>) {
    return value._allowedValue;
  }
}
