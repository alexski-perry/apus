import {
  ObjectQueryData,
  Query,
  Cardinality,
  QueryData,
  Value,
  ValueQueryData,
  queryStage,
  QueryStage,
} from "@core";
import { CallSubqueryClause, ClauseMapping, withClause } from "@core/clause";
import { allVariablesFromDataShape, DataShape } from "@core/data-shape";
import { mapQueryData, typeOf } from "@core/utils";
import { defineVariable$, resolveSubquery$, resolveValue$ } from "@core/resolve-utils";
import { Variable } from "@core/value-data";
import { deepMap } from "@utils/deepMap";

export const $map = <TMapping extends Mapping<"1->1">>(
  mapping: TMapping,
): QueryStage<ParseMapping<TMapping>, "same", "overwrite"> => createMapStage(mapping, "1->1");

export const $mapMany = <TMapping extends Mapping<"1->m">>(
  mapping: TMapping,
): QueryStage<ParseMapping<TMapping>, "force-many", "overwrite"> =>
  createMapStage(mapping, "1->m");

export const $mapOptional = <TMapping extends Mapping<"1->?">>(
  mapping: TMapping,
): QueryStage<ParseMapping<TMapping>, "optional", "overwrite"> =>
  createMapStage(mapping, "1->?");

const createMapStage = (
  mapping: Mapping<any>,
  mapType: MapType,
): QueryStage<any, any, any> => {
  // special case: if mapping a query, just append the operations -- todo consider doing the same for named query data with just one query
  if (mapping instanceof Query) {
    const { input, stages } = Query.getData(mapping);

    const inputVariables: Variable[] = [];
    const inputShape: DataShape = mapQueryData(input, inputValue => {
      const rawValue = resolveValue$(inputValue);
      if (rawValue.kind === "expression") {
        throw new Error("can't import composite expression into subquery");
      } else if (rawValue.kind === "variable") {
        inputVariables.push(rawValue);
        return rawValue;
      } else {
        return rawValue;
      }
    });

    return queryStage({
      clauses: [withClause(inputVariables.map(variable => ({ output: variable })))],
      outputShape: inputShape,
      additionalStages: stages,
      cardinalityBehaviour: {
        "1->1": "same" as const,
        "1->?": "optional" as const,
        "1->m": "force-many" as const,
      }[mapType],
      dataBehaviour: "overwrite",
    });
  }

  const subqueryClauses: CallSubqueryClause[] = [];
  const withClauseMappings: Array<ClauseMapping> = [];

  const outputShape: DataShape = deepMap(
    mapping,
    el => el instanceof Value || el instanceof Query,
    (mapping: Value | Query<any, any>) => {
      if (mapping instanceof Value) {
        const rawValue = resolveValue$(mapping);

        if (rawValue.kind === "variable") {
          const variable = rawValue;
          withClauseMappings.push({ output: variable });
          return variable;
        } else if (rawValue.kind === "expression") {
          const variable = defineVariable$(typeOf(mapping));
          withClauseMappings.push({ output: variable, input: rawValue });
          return variable;
        } else {
          return rawValue; // a parameter, so no need to add to WITH clause
        }
      }

      if (mapping instanceof Query) {
        const { outputShape, clauses } = resolveSubquery$(mapping);
        withClauseMappings.push(
          ...allVariablesFromDataShape(outputShape).map(variable => ({ output: variable })),
        );
        subqueryClauses.push({ type: "CALL SUBQUERY", clauses: clauses });
        return outputShape;
      }
    },
  );

  return queryStage({
    clauses: [...subqueryClauses, withClause(withClauseMappings)],
    outputShape,
    cardinalityBehaviour: {
      "1->1": "same" as const,
      "1->?": "optional" as const,
      "1->m": "force-many" as const,
    }[mapType],
    dataBehaviour: "overwrite",
  });
};

/*
  TYPES
 */

type MapType = "1->1" | "1->m" | "1->?";

export type Mapping<TMapType extends MapType> =
  | Value
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

type QueryMapping<TType extends QueryData, TMapType extends MapType> = {
  "1->1": Query<TType, "one">;
  "1->?": Query<TType, "one" | "none-or-one">;
  "1->m": Query<TType, "one" | "none-or-one" | "many">;
}[TMapType];

type ObjectMapping<TMapType extends MapType> = {
  [key: string]:
    | Value
    | QueryMapping<ValueQueryData | ObjectQueryData, TMapType>
    | ObjectMapping<TMapType>;
};

export type ParseMapping<TMapping extends Mapping<any>> = TMapping extends Value
  ? TMapping
  : TMapping extends Query<infer TData extends QueryData, Cardinality>
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
