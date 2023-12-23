import { PropertyValue, List, Optional } from "@cypher/types";
import { AnyProperty } from "@cypher/types/property-types/any-property";

export type AllowedPropertyValue =
  | PropertyValue
  | List<AllowedPropertyValue>
  | Optional<AllowedPropertyValue>
  | AnyProperty;
