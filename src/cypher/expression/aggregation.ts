import { Value } from "@core/value";
import { List } from "@cypher/types/list";
import { Map } from "@cypher/types/map";
import { expression, makeExpressionFromQueryData } from "@core/expression";
import { Type, typeOf } from "@core/type/type";
import { mapQueryData } from "@core/query-data";

export function collectAgg<T extends Value | Record<string, Value>>(
  value: T,
): List<T extends Value ? T : T extends Record<string, Value> ? Map<T> : never> {
  const innerType: Type =
    value instanceof Value
      ? typeOf(value)
      : Map.makeType(mapQueryData(value, val => typeOf(val)));

  const innerExpression = makeExpressionFromQueryData(value);
  return expression(List.makeType(innerType))`collect(${innerExpression})` as any;
}
