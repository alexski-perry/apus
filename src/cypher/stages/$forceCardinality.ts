import { Cardinality, queryStage, QueryStage } from "@core";

export const $forceCardinality = <TCardinality extends Cardinality>(
  cardinality: TCardinality,
): QueryStage<
  void,
  {
    one: "force-one";
    "none-or-one": "force-none-or-one";
    many: "force-many";
  }[TCardinality],
  "merge"
> =>
  queryStage({
    outputShape: undefined,
    clauses: [],
    cardinalityBehaviour: {
      one: "force-one" as const,
      "none-or-one": "force-none-or-one" as const,
      many: "force-many" as const,
    }[cardinality],
    dataBehaviour: "merge",
  });
