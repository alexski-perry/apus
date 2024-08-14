import { Value } from "@core/value";
import { forceNotOptional, isNotNull, isNull, nullConst, Optional } from "neo4j-querier";
import { Mapping, ParseMapping } from "@cypher/operations/$map";
import { MakeOptional } from "@cypher/types/optional";
import { ValueFromQueryData } from "@core/query-data";
import { queryOperation, QueryOperation } from "@core/query-operation";
import {
  importWithClause,
  returnClause,
  unionSubqueryClause,
  whereClause,
  withClause,
} from "@core/clause";
import { handleMapping } from "@cypher/operations/utils/handleMapping";
import { makeExpressionFromDataShape } from "@core/data-shape";

export function $mapMaybe<TIn extends Value, TOut extends Mapping<"->one">>(
  value: Optional<TIn>,
  mapF: (val: NoInfer<TIn>) => TOut,
): QueryOperation<MakeOptional<ValueFromQueryData<ParseMapping<TOut>>>, "->one", "overwrite"> {
  return queryOperation({
    name: "$mapMaybe",
    resolver: resolveInfo => {
      const inputVariable = resolveInfo.resolveVariable(value);

      const mapResult = mapF(forceNotOptional(value));

      const { withClauseMappings, outputShape, subqueryClauses } = handleMapping(
        mapResult,
        resolveInfo,
      );

      const output = makeExpressionFromDataShape(outputShape);
      const outputVariable = resolveInfo.defineVariable(Optional.makeType(output.type));

      return {
        clauses: [
          unionSubqueryClause(
            [
              [
                importWithClause([inputVariable]),
                whereClause([Value.getValueInfo(isNotNull(value))]),
                ...subqueryClauses,
                withClause(withClauseMappings),
                returnClause([{ input: output, output: outputVariable }]),
              ],
              [
                importWithClause([inputVariable]),
                whereClause([Value.getValueInfo(isNull(value))]),
                returnClause([
                  { input: Value.getValueInfo(nullConst()), output: outputVariable },
                ]),
              ],
            ],
            "distinct", // doesn't matter
          ),
        ],
        outputShape: outputVariable,
        dataBehaviour: "overwrite",
        cardinalityBehaviour: "->one",
      };
    },
  });
}
