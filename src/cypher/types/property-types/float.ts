import { PropertyValue } from "./property";
import { setTypeInfo } from "@core/type";
import { ConstructorOf } from "@utils/ConstructorOf";

export abstract class FloatValue<T extends number> extends PropertyValue<T, T> {
  private declare _typeInfo_FloatValue: T;
}

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
  constructor(private _literalValue: number) {
    super();
  }

  static of<T extends number>(allowedValue: T): ConstructorOf<FloatLiteral<T>> {
    const floatClass = class extends FloatLiteral<T> {
      constructor() {
        super(allowedValue);
      }
    };

    setTypeInfo(floatClass, {
      parseValue: val => {
        if (val === allowedValue) return val;
      },
      serialize: val => {
        if (val === allowedValue) return val;
      },
      debugName: `FloatLiteral<${allowedValue}>`,
    });

    return floatClass;
  }
}
