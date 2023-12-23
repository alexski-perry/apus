import { QueryStage, Value } from "@core";
import { $callProcedure } from "@cypher/stages/$callProcedure";
import { isNull } from "@cypher/expression";
import { parameterize } from "@cypher/expression/param";
import { Any, String } from "@cypher/types";
import { expression } from "@cypher/expression/core";

export const $throwIfNull = (
  value: Value,
  message?: string,
): QueryStage<void, "same", "merge"> =>
  $callProcedure("apoc.util.validate", [
    isNull(value),
    parameterize(message ?? "Null value encountered", String),
    expression(Any)`[]`,
  ]);
