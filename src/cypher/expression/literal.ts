import { StringLiteral } from "@cypher/types";
import { parameterize } from "@cypher/expression/param";

export const stringLiteral = <T extends string>(value: T): StringLiteral<T> =>
  parameterize(value, StringLiteral.of(value));
