import { Value } from "@core";
import { List } from "@cypher/types";
import { typeOf } from "@core/utils";
import { expression } from "@cypher/expression/core";

export const collectAgg = <T extends Value>(value: T): List<T> =>
  expression(List.of(typeOf(value)))`collect(${value})`;
