import { TypeOf } from "@core/type/type";
import { GetValueInputType } from "@core/value";
import { makeParam } from "@core/makeParam";
import { ScalarValue } from "@cypher/types/scalar";
import { List } from "@cypher/types/list";
import { Optional } from "@cypher/types/optional";
import { Map } from "@cypher/types/map";

export function parameterize<T extends ParameterizableValue>(
  type: TypeOf<T>,
  value: GetValueInputType<NoInfer<T>>,
): T {
  return makeParam(value, type);
}

/*
  INTERNAL
 */

type ParameterizableValue =
  | ScalarValue<any, any, any>
  | Optional<ParameterizableValue>
  | List<ParameterizableValue>
  | Map<{
      [key: string]: ParameterizableValue;
    }>;
