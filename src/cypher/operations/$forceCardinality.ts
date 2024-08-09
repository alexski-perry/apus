import { QueryCardinality } from "@core/query-cardinality";
import { queryOperation, QueryOperation } from "@core/query-operation";

export const $forceCardinality = <TCardinality extends QueryCardinality>(
  cardinality: TCardinality,
): QueryOperation<
  void,
  {
    one: "force-one";
    "none-or-one": "force-none-or-one";
    many: "force-many";
  }[TCardinality],
  "merge"
> => {
  return queryOperation({
    name: "$forceCardinality",
    resolver: () => {
      return {
        outputShape: undefined,
        clauses: [],
        cardinalityBehaviour: {
          one: "force-one" as const,
          "none-or-one": "force-none-or-one" as const,
          many: "force-many" as const,
        }[cardinality],
        dataBehaviour: "merge",
      };
    },
  });
};
