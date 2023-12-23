import { Cardinality, Value, queryStage, QueryStage } from "@core";
import { ConstructorOf } from "@utils/ConstructorOf";
import { Deconstruct } from "@utils/deconstruct";
import { callProcedureClause, ProcedureResult } from "@core/clause";
import { defineVariable$, resolveValue$ } from "@core/resolve-utils";
import { DataShape } from "@core/data-shape";

export const $callProcedure = <
  TOutput extends Record<string, ConstructorOf<Value>> = {},
  TCardinality extends Cardinality = "one",
>(
  name: string,
  args: Array<Value>,
  yields?: TOutput,
  cardinality?: TCardinality,
): CallProcedureOperation<TOutput, TCardinality> => {
  const yieldsList: ProcedureResult[] = [];
  const output: DataShape = {};

  Object.entries(yields ?? {}).forEach(([resultName, type]) => {
    const outputVariable = defineVariable$(type);
    yieldsList.push({ name: resultName, output: outputVariable });
    output[name] = outputVariable;
  });

  return queryStage({
    clauses: [
      callProcedureClause({
        name,
        args: args.map(arg => resolveValue$(arg)),
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
  });
};

type CallProcedureOperation<
  TOutput extends Record<string, ConstructorOf<Value>>,
  TCardinality extends Cardinality,
> = QueryStage<
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
