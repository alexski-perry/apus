import { StringLiteral } from "@cypher/types/scalar/string";
import { BooleanLiteral } from "@cypher/types/scalar/boolean";

import { makeParam } from "@core/makeParam";
import { expression } from "@core/expression";
import { Null } from "@cypher/types/null";

export const stringConst = <T extends string>(value: T): StringLiteral<T> =>
  makeParam(value, StringLiteral.makeType([value]));

export const booleanConst = <T extends boolean>(value: T): BooleanLiteral<T> =>
  makeParam(value, BooleanLiteral.makeType(value));

export function nullConst() {
  return expression(Null)`null`;
}
