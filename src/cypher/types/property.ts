import { ScalarValue } from "@cypher/types/scalar";
import { List } from "@cypher/types/list";
import { Optional } from "@cypher/types/optional";
import { Any } from "@cypher/types/any";

export type PropertyValue =
  | ScalarValue<any, any, any>
  | List<ScalarValue<any, any, any> | Optional<ScalarValue<any, any, any>>>
  | Optional<ScalarValue<any, any, any>>
  | Any;
