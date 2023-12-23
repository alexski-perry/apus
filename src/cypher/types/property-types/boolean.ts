import { PropertyValue } from "./property";
import { setTypeInfo } from "@core/type";
import { ConstructorOf } from "@utils/ConstructorOf";

export abstract class BooleanValue<T extends boolean> extends PropertyValue<T, T> {
  private declare _typeInfo_BooleanValue: T;
}

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
  constructor(private _literalValue: boolean) {
    super();
  }

  static of<T extends boolean>(allowedValue: T): ConstructorOf<BooleanLiteral<T>> {
    const booleanClass = class extends BooleanLiteral<T> {
      constructor() {
        super(allowedValue);
      }
    };

    setTypeInfo(booleanClass, {
      parseValue: val => {
        if (val === allowedValue) return val;
      },
      serialize: val => {
        if (val === allowedValue) return val;
      },
      debugName: `BooleanLiteral<${allowedValue}>`,
    });

    return booleanClass;
  }
}
