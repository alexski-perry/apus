import { PropertyValue } from "./property";
import { Integer } from "neo4j-driver";
import { setTypeInfo } from "@core/type";
import { ConstructorOf } from "@utils/ConstructorOf";

export abstract class IntValue<TInput, TOutput extends number> extends PropertyValue<
  TInput,
  TOutput
> {
  private declare _typeInfo_IntValue: [TInput, TOutput];
}

export class Int extends IntValue<number | Integer, number> {}

setTypeInfo(Int, {
  parseValue: value => {
    if (value instanceof Integer) return value.toNumber();
    if (typeof value === "number" && Number.isInteger(value)) return value;
  },
  serialize: value => {
    if (typeof value === "number" && Number.isInteger(value)) return Integer.fromInt(value);
    if (value instanceof Integer) return value;
  },
  debugName: "Int",
});

export class IntLiteral<T extends number> extends IntValue<T, T> {
  constructor(private _literalValue: number) {
    super();
  }

  static of<T extends number>(allowedValue: T): ConstructorOf<IntLiteral<T>> {
    if (!Number.isInteger(allowedValue)) {
      throw new Error("Attempted to create a IntLiteral from float");
    }

    const intClass = class extends IntLiteral<T> {
      constructor() {
        super(allowedValue);
      }
    };

    setTypeInfo(intClass, {
      parseValue: val => {
        if (val instanceof Integer) {
          const value = val.toNumber();
          if (value === allowedValue) return value;
        }
        if (typeof val === "number" && val === allowedValue) return val;
      },
      serialize: val => {
        if (val === allowedValue) return Integer.fromInt(val);
      },
      debugName: `IntLiteral<${allowedValue}>`,
    });

    return intClass;
  }
}
