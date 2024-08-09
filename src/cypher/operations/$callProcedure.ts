import { ConstructorOf } from "@utils/ConstructorOf";
import { Deconstruct } from "@utils/deconstruct";
import { callProcedureClause, ProcedureResult } from "@core/clause";
import { QueryCardinality } from "@core/query-cardinality";
import { Value } from "@core/value";
import { QueryOperation, queryOperation } from "@core/query-operation";
import { DataShape } from "@core/data-shape";

export const $callProcedure = <
  TOutput extends Record<string, ConstructorOf<Value>> = {},
  TCardinality extends QueryCardinality = "one",
>(
  name: string,
  args: Array<Value>,
  yields?: TOutput,
  cardinality?: TCardinality,
): CallProcedureOperation<TOutput, TCardinality> => {
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
          one: "same" as const,
          "none-or-one": "optional" as const,
          many: "force-many" as const,
        }[cardinality ?? "one"],
        dataBehaviour: "merge",
      };
    },
  });
};

type CallProcedureOperation<
  TOutput extends Record<string, ConstructorOf<Value>>,
  TCardinality extends QueryCardinality,
> = QueryOperation<
  keyof {
    [K in keyof TOutput]: Deconstruct<TOutput[K]>;
  } extends never
    ? void
    : {
        [K in keyof TOutput]: Deconstruct<TOutput[K]>;
      },
  {
    one: "same";
    "none-or-one": "optional";
    many: "force-many";
  }[TCardinality],
  "merge"
>;
