import { Value } from "@core/value";
import { setTypeInfo } from "@core/type";

export class Null extends Value<null, null> {}

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
