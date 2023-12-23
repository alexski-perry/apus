import { PropertyValue } from "@cypher/types";
import { setTypeInfo } from "@core/type";

export class JSON extends PropertyValue<object, object> {}

setTypeInfo(JSON, {
  parseValue: value => {
    if (typeof value !== "string") return;
    try {
      return globalThis.JSON.parse(value);
    } catch (e) {
      return;
    }
  },
  serialize: value => {
    if (typeof value !== "object" || value === null) return;
    try {
      return globalThis.JSON.stringify(value);
    } catch (e) {
      return;
    }
  },
  debugName: "JSON",
});
