import { Value } from "@core/value";

import { setTypeInfo } from "@core/type/type-info";

export class Null extends Value<"Null", null, null> {}

setTypeInfo(Null, {
  parseValue: value => {
    if (value !== null) return undefined;
    return null;
  },
  serialize: value => {
    if (value !== null) return undefined;
    return null;
  },
  debugName: "Null",
});
