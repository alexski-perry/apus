import { CallSubqueryClause, ClauseMapping, withClause } from "@core/clause";
import { allVariablesFromDataShape, DataShape } from "@core/data-shape";
import { Variable } from "@core/value-info";
import { deepMap } from "@utils/deepMap";
import { queryOperation, QueryOperation } from "@core/query-operation";
import { Query } from "@core/query";
import { Value } from "@core/value";
import { mapQueryData, QueryData, QueryDataMap } from "@core/query-data";
import { QueryCardinality } from "@core/query-cardinality";
import { typeOf } from "@core/type/type";

export const $map = <TMapping extends Mapping<"1->1">>(
  mapping: TMapping,
): QueryOperation<ParseMapping<TMapping>, "same", "overwrite"> =>
  createMapOperation(mapping, "1->1", "$map");

export const $mapMany = <TMapping extends Mapping<"1->m">>(
  mapping: TMapping,
): QueryOperation<ParseMapping<TMapping>, "force-many", "overwrite"> =>
  createMapOperation(mapping, "1->m", "$mapMany");

export const $mapOptional = <TMapping extends Mapping<"1->?">>(
  mapping: TMapping,
): QueryOperation<ParseMapping<TMapping>, "optional", "overwrite"> =>
  createMapOperation(mapping, "1->?", "$mapOptional");

const createMapOperation = (
  mapping: Mapping<any>,
  mapType: MapType,
  name: string,
): QueryOperation<any, any, any> => {
  // special case: if mapping a query, just append the operations -- todo consider doing the same for named query data with just one query
  if (mapping instanceof Query) {
    const { input, stages } = Query.resolve(mapping);

    return queryOperation({
      name,
      resolver: resolveInfo => {
        const inputVariables: Variable[] = [];
        const inputShape: DataShape = mapQueryData(input, inputValue => {
          const rawValue = resolveInfo.resolveValue(inputValue);
          if (rawValue.kind === "expression") {
            throw new Error("can't import composite expression into subquery");
          } else if (rawValue.kind === "variable") {
            inputVariables.push(rawValue);
            return rawValue;
          } else {
            // parameter
            return rawValue;
          }
        });

        return {
          clauses: [withClause(inputVariables.map(variable => ({ output: variable })))],
          outputShape: inputShape,
          cardinalityBehaviour: {
            "1->1": "same" as const,
            "1->?": "optional" as const,
            "1->m": "force-many" as const,
          }[mapType],
          dataBehaviour: "overwrite",
          additionalStages: stages,
        };
      },
    });
  }

  return queryOperation({
    name,
    resolver: resolveInfo => {
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

      return {
        clauses: [...subqueryClauses, withClause(withClauseMappings)],
        outputShape,
        cardinalityBehaviour: {
          "1->1": "same" as const,
          "1->?": "optional" as const,
          "1->m": "force-many" as const,
        }[mapType],
        dataBehaviour: "overwrite",
      };
    },
  });
};

/*
  TYPES
 */

type MapType = "1->1" | "1->m" | "1->?";

export type Mapping<TMapType extends MapType = MapType> =
  | Value
  // | QueryData todo remove if all ok
  | QueryMapping<QueryData, TMapType>
  | ObjectMapping<TMapType>
  | TupleMapping<TMapType>;

type TupleMappingElement<TMapType extends MapType> = Value | QueryMapping<Value, TMapType>;

type TupleMapping<TMapType extends MapType> =
  | [TupleMappingElement<TMapType>, TupleMappingElement<TMapType>]
  | [
      TupleMappingElement<TMapType>,
      TupleMappingElement<TMapType>,
      TupleMappingElement<TMapType>,
    ];

export type QueryMapping<
  TType extends QueryData,
  TMapType extends MapType,
> = TMapType extends MapType
  ? {
      "1->1": Query<TType, "one">;
      "1->?": Query<TType, "one" | "none-or-one">;
      "1->m": Query<TType, "one" | "none-or-one" | "many">;
    }[TMapType]
  : never;

type ObjectMapping<TMapType extends MapType> = {
  [key: string]:
    | Value
    | QueryMapping<Value | QueryDataMap, TMapType>
    | ObjectMapping<TMapType>;
};

export type ParseMapping<TMapping extends Mapping<any>> = TMapping extends Value
  ? TMapping
  : TMapping extends Query<infer TData extends QueryData, QueryCardinality>
    ? TData
    : TMapping extends ObjectMapping<any>
      ? {
          [K in keyof TMapping]: ParseMapping<TMapping[K]>;
        }
      : TMapping extends TupleMapping<any>
        ? {
            [I in keyof TMapping]: ParseMapping<TMapping[I]>;
          }
        : void;
