import { ScalarValue } from "../scalar";
import { setTypeInfo } from "@core/type/type-info";
import { TypeOf } from "@core/type/type";

export abstract class FloatValue<T extends number> extends ScalarValue<["Float", T], T, T> {}

export class Float extends FloatValue<number> {}

setTypeInfo(Float, {
  parseValue: val => {
    if (typeof val === "number") return val;
  },
  serialize: val => {
    if (typeof val === "number") return val;
  },
  debugName: "Float",
});

export class FloatLiteral<T extends number> extends FloatValue<T> {
  constructor(private _allowedValues: number[]) {
    super();
  }

  static makeType<const T extends number[]>(
    allowedValues: T,
  ): TypeOf<FloatLiteral<T[number]>> {
    const floatClass = class extends FloatLiteral<T[number]> {
      constructor() {
        super(allowedValues);
      }
    };

    setTypeInfo(floatClass, {
      parseValue: val => {
        if (typeof val === "number" && allowedValues.includes(val)) return val;
      },
      serialize: val => {
        if (allowedValues.includes(val)) return val;
      },
      debugName: `FloatLiteral<${allowedValues.join(" | ")}>`,
    });

    return floatClass;
  }

  static getAllowedValues(value: FloatLiteral<any>) {
    return value._allowedValues;
  }
}
