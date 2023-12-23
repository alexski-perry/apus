import { QueryStage } from "@core";
import { Any, Boolean, String } from "@cypher/types";
import { $callProcedure } from "@cypher/stages/$callProcedure";
import { parameterize } from "@cypher/expression/param";
import { expression } from "@cypher/expression/core";

export const $assert = (
  predicate: Boolean,
  message?: string,
): QueryStage<void, "same", "merge"> =>
  $callProcedure("apoc.util.validate", [
    predicate,
    parameterize(message ?? "Assertion failed", String),
    expression(Any)`[]`,
  ]);
