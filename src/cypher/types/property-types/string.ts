import { PropertyValue } from "./property";
import { setTypeInfo } from "@core/type";
import { ConstructorOf } from "@utils/ConstructorOf";

export abstract class StringValue<T extends string = string> extends PropertyValue<T, T> {
  private declare _typeInfo_StringValue: T;
}

export class String extends StringValue {}

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
  constructor(private _literalValue: string) {
    super();
  }

  static of<T extends string>(allowedValue: T): ConstructorOf<StringLiteral<T>> {
    const stringClass = class extends StringLiteral<T> {
      constructor() {
        super(allowedValue);
      }
    };

    setTypeInfo(stringClass, {
      parseValue: val => {
        if (val === allowedValue) return val;
      },
      serialize: val => {
        if (val === allowedValue) return val;
      },
      debugName: `StringLiteral<${allowedValue}>`,
    });

    return stringClass;
  }
}
