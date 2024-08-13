import { $callProcedure } from "@cypher/operations/$callProcedure";
import { expression } from "@core/expression";
import { QueryOperation } from "@core/query-operation";
import { Any } from "@cypher/types/any";
import { String } from "@cypher/types/scalar/string";
import { Boolean } from "@cypher/types/scalar/boolean";

import { parameterize } from "@core/parameterize";

export const $throwIf = (
  predicate: Boolean,
  message?: string,
): QueryOperation<void, "->one", "merge"> =>
  $callProcedure("apoc.util.validate", [
    predicate,
    parameterize(message ?? "Assertion failed", String),
    expression(Any)`[]`,
  ]);
