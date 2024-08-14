import { CallSubqueryClause, ClauseMapping } from "@core/clause";
import { allVariablesFromDataShape, DataShape } from "@core/data-shape";
import { deepMap } from "@utils/deepMap";
import { Value } from "@core/value";
import { Query } from "@core/query";
import { typeOf } from "@core/type/type";
import { Mapping } from "@cypher/operations/$map";
import { QueryOperationResolveInfo } from "@build/QueryOperationResolveInfo";

export function handleMapping(mapping: Mapping<any>, resolveInfo: QueryOperationResolveInfo) {
  const subqueryClauses: CallSubqueryClause[] = [];
  const withClauseMappings: Array<ClauseMapping> = [];

  const outputShape: DataShape = deepMap(
    mapping,
    el => el instanceof Value || el instanceof Query,
    (mapping: Value | Query<any, any>) => {
      if (mapping instanceof Value) {
        const rawValue = resolveInfo.resolveValue(mapping);

        if (rawValue.kind === "variable") {
          const variable = rawValue;
          withClauseMappings.push({ output: variable });
          return variable;
        } else if (rawValue.kind === "expression") {
          const variable = resolveInfo.defineVariable(typeOf(mapping));
          withClauseMappings.push({ output: variable, input: rawValue });
          return variable;
        } else {
          return rawValue; // a parameter, so no need to add to WITH clause
        }
      }

      if (mapping instanceof Query) {
        const { outputShape, clauses } = resolveInfo.resolveSubquery(mapping);
        withClauseMappings.push(
          ...allVariablesFromDataShape(outputShape).map(variable => ({
            output: variable,
          })),
        );
        subqueryClauses.push({ type: "CALL SUBQUERY", clauses: clauses });
        return outputShape;
      }
    },
  );

  return { outputShape, subqueryClauses, withClauseMappings };
}
