import { ScalarValue } from "../scalar";
import { Integer } from "neo4j-driver";
import { setTypeInfo } from "@core/type/type-info";
import { TypeOf } from "@core/type/type";

export abstract class IntValue<T extends number> extends ScalarValue<
  ["Int", T],
  number | Integer,
  T
> {}

export class Int extends IntValue<number> {}

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

export class IntLiteral<T extends number> extends IntValue<T> {
  constructor(private _allowedValues: number[]) {
    super();
  }

  static makeType<const T extends number[]>(allowedValues: T): TypeOf<IntLiteral<T[number]>> {
    allowedValues.forEach(value => {
      if (!Number.isInteger(value)) {
        throw new Error(
          "Attempted to create a IntLiteral type that allow something that's not an integer",
        );
      }
    });

    const type = class extends IntLiteral<T[number]> {
      constructor() {
        super(allowedValues);
      }
    };

    setTypeInfo(type, {
      parseValue: val => {
        if (val instanceof Integer) {
          const value = val.toNumber();
          if (allowedValues.includes(value)) return value;
        }
        if (typeof val === "number" && allowedValues.includes(val)) return val;
      },
      serialize: val => {
        if (allowedValues.includes(val)) return Integer.fromInt(val);
      },
      debugName: `IntLiteral<${allowedValues.join(" | ")}>`,
    });

    return type;
  }

  static getAllowedValues(value: IntLiteral<any>) {
    return value._allowedValues;
  }
}
