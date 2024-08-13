import { QueryCardinality } from "@core/query-cardinality";
import { queryOperation, QueryOperation } from "@core/query-operation";

export const $forceCardinality = <TCardinality extends QueryCardinality>(
  cardinality: TCardinality,
): QueryOperation<
  void,
  {
    one: "!one";
    "none-or-one": "!none-or-one";
    "one-or-more": "!one-or-more";
    many: "!many";
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
          one: "!one" as const,
          "none-or-one": "!none-or-one" as const,
          "one-or-more": "!one-or-more" as const,
          many: "!many" as const,
        }[cardinality],
        dataBehaviour: "merge",
      };
    },
  });
};
