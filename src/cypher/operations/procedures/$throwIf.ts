import { $callProcedure } from "@cypher/operations/$callProcedure";
import { expression } from "@core/expression";
import { QueryOperation } from "@core/query-operation";
import { Any } from "@cypher/types/any";
import { String } from "@cypher/types/scalar/string";
import { Boolean } from "@cypher/types/scalar/boolean";

import { makeParam } from "@core/makeParam";

export const $throwIf = (
  predicate: Boolean,
  message?: string,
): QueryOperation<void, "->one", "merge"> =>
  $callProcedure("apoc.util.validate", [
    predicate,
    makeParam(message ?? "Assertion failed", String),
    expression(Any)`[]`,
  ]);
