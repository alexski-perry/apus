import { Deconstruct } from "@utils/deconstruct";
import { callProcedureClause, ProcedureResult } from "@core/clause";
import { QueryCardinality } from "@core/query-cardinality";
import { Value } from "@core/value";
import { QueryOperation, queryOperation } from "@core/query-operation";
import { DataShape } from "@core/data-shape";
import { Type } from "@core/type/type";

export function $callProcedure<
  TYields extends Record<string, Type> = {},
  TCardinality extends QueryCardinality = "one",
>(
  name: string,
  args: Array<Value>,
  yields?: TYields,
  cardinality?: TCardinality,
): QueryOperation<
  MakeQueryDataFromYields<TYields>,
  {
    one: "->one";
    "none-or-one": "->none-or-one";
    "one-or-more": "->one-or-more";
    many: "->many";
  }[TCardinality],
  "merge"
> {
  return queryOperation({
    name: "$callProcedure",
    resolver: resolveInfo => {
      const yieldsList: ProcedureResult[] = [];
      const output: DataShape = {};

      Object.entries(yields ?? {}).forEach(([resultName, type]) => {
        const outputVariable = resolveInfo.defineVariable(type);
        yieldsList.push({ name: resultName, output: outputVariable });
        output[name] = outputVariable;
      });

      return {
        clauses: [
          callProcedureClause({
            name,
            args: args.map(arg => resolveInfo.resolveValue(arg)),
            yields: yieldsList,
          }),
        ],
        outputShape: Object.keys(output).length === 0 ? undefined : output,
        cardinalityBehaviour: {
          one: "->one" as const,
          "none-or-one": "->none-or-one" as const,
          "one-or-more": "->one-or-more" as const,
          many: "->many" as const,
        }[cardinality ?? "one"],
        dataBehaviour: "merge",
      };
    },
  });
}

/*
  INTERNAL
 */

type MakeQueryDataFromYields<TYields extends Record<string, Type>> = keyof {
  [K in keyof TYields]: Deconstruct<TYields[K]>;
} extends never
  ? void
  : {
      [K in keyof TYields]: Deconstruct<TYields[K]>;
    };
