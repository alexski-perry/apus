import { Value } from "@core/value";
import { List } from "@cypher/types/list";
import { expression } from "@core/expression";
import { typeOf } from "@core/type/type";

export function collectAgg<T extends Value>(value: T): List<T> {
  return expression(List.makeType(typeOf(value)))`collect(${value})`;
}
