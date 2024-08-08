import { StringLiteral } from "@cypher/types/scalar/string";
import { BooleanLiteral } from "@cypher/types/scalar/boolean";

import { parameterize } from "@core/parameterize";

export const stringConst = <T extends string>(value: T): StringLiteral<T> =>
  parameterize(value, StringLiteral.makeType([value]));

export const booleanConst = <T extends boolean>(value: T): BooleanLiteral<T> =>
  parameterize(value, BooleanLiteral.makeType(value));
