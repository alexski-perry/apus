import { ScalarValue } from "../scalar";
import { ConstructorOf } from "@utils/ConstructorOf";
import { setTypeInfo } from "@core/type/type-info";

export abstract class StringValue<T extends string = string> extends ScalarValue<
  ["String", T],
  T,
  T
> {}

export class String extends StringValue<string> {}

setTypeInfo(String, {
  parseValue: val => {
    if (typeof val === "string") return val;
  },
  serialize: val => {
    if (typeof val === "string") return val;
  },
  debugName: "String",
});

export class StringLiteral<T extends string> extends StringValue<T> {
  constructor(private _allowedValues: string[]) {
    super();
  }

  static makeType<const T extends string[]>(
    allowedValues: T,
  ): ConstructorOf<StringLiteral<T[number]>> {
    const type = class extends StringLiteral<T[number]> {
      constructor() {
        super(allowedValues);
      }
    };

    setTypeInfo(type, {
      parseValue: val => {
        if (typeof val === "string" && allowedValues.includes(val)) return val;
      },
      serialize: val => {
        if (allowedValues.includes(val)) return val;
      },
      debugName: `StringLiteral<${allowedValues.join(" | ")}>`,
    });

    return type;
  }

  static getAllowedValues(value: StringLiteral<any>) {
    return value._allowedValues;
  }
}
