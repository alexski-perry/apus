import { PropertyValue } from "./property";
import { setTypeInfo } from "@core/type";

export class ID extends PropertyValue<string, string> {
  private declare _discriminator: "id";
}

setTypeInfo(ID, {
  parseValue: val => {
    if (typeof val === "string") return val;
  },
  serialize: val => {
    if (typeof val === "string") return val;
  },
  debugName: "String",
});
