import { ConstructorOf } from "@utils/ConstructorOf";
import { AllowedPropertyValue, Boolean } from "@cypher/types";
import { Value } from "@core";

interface PropertyDefinition {
  type: ConstructorOf<AllowedPropertyValue>;
  overrideName?: string;
  creationStrategy:
    | { kind: "input" }
    | { kind: "autogen"; autogenValue: any; canOverride: boolean };
  updateStrategy:
    | { kind: "input" }
    | { kind: "not-allowed" }
    | { kind: "autogen"; autogenValue: any; canOverride: boolean };
  validate?: (val: Value) => Boolean;
}

interface PropertyTypeInfo {
  type: AllowedPropertyValue;
  creationStrategy: "input" | "autogen" | "with-default";
  updateStrategy: "input" | "not-allowed" | "autogen" | "with-default";
}

export class Property<TTypeInfo extends PropertyTypeInfo> {
  private declare _typeInfo: TTypeInfo;

  constructor(private _definition: PropertyDefinition) {}

  static getDefinition(property: Property<any>): PropertyDefinition {
    return property._definition;
  }
}
