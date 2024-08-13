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

export const $map = <TMapping extends Mapping<"->one">>(
  mapping: TMapping,
): QueryOperation<ParseMapping<TMapping>, "->one", "overwrite"> => {
  return createMapOperation(mapping, "->one", "$map");
};

export const $mapNoneOrOne = <TMapping extends Mapping<"->none-or-one">>(
  mapping: TMapping,
): QueryOperation<ParseMapping<TMapping>, "->none-or-one", "overwrite"> => {
  return createMapOperation(mapping, "->none-or-one", "$mapNoneOrOne");
};

export const $mapOneOrMore = <TMapping extends Mapping<"->one-or-more">>(
  mapping: TMapping,
): QueryOperation<ParseMapping<TMapping>, "->one-or-more", "overwrite"> => {
  return createMapOperation(mapping, "->one-or-more", "$mapNoneOrOne");
};

export const $mapMany = <TMapping extends Mapping<"->many">>(
  mapping: TMapping,
): QueryOperation<ParseMapping<TMapping>, "->many", "overwrite"> => {
  return createMapOperation(mapping, "->many", "$mapMany");
};

const createMapOperation = (
  mapping: Mapping<any>,
  mapType: MapType,
  name: string,
): QueryOperation<any, any, any> => {
  // todo merge all this with with buildSubquery
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
          cardinalityBehaviour: mapType,
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
        cardinalityBehaviour: mapType,
        dataBehaviour: "overwrite",
      };
    },
  });
};

/*
  TYPES
 */

type MapType = "->one" | "->none-or-one" | "->one-or-more" | "->many";

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
      "->one": Query<TType, "one">;
      "->none-or-one": Query<TType, "one" | "none-or-one">;
      "->one-or-more": Query<TType, "one" | "one-or-more">;
      "->many": Query<TType, "one" | "one-or-more" | "none-or-one" | "many">;
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
