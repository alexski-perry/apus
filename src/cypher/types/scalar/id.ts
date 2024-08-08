import { ScalarValue } from "../scalar";

import { setTypeInfo } from "@core/type/type-info";

export class ID extends ScalarValue<"ID", string, string> {}

setTypeInfo(ID, {
  parseValue: val => {
    if (typeof val === "string") return val;
  },
  serialize: val => {
    if (typeof val === "string") return val;
  },
  debugName: "String",
});
