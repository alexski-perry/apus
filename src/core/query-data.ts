import { GetValueOutputType, Value } from "@core/value";
import { deepMap } from "@utils/deepMap";
import { Id } from "@utils/Id";
import { Null } from "@cypher/types/null";
import { Map } from "@cypher/types/map";
import { Pair } from "@cypher/types/pair";
import { Triple } from "@cypher/types/triple";
import { MakeOptional } from "@cypher/types/optional";

export type QueryData = void | Value | QueryDataMap | TupleQueryData;

export type QueryDataMap = {
  [key: string]: Value | QueryDataMap;
};

export type TupleQueryData = [Value, Value] | [Value, Value, Value];

/**
 * Guard for QueryDataMap
 */
export const isQueryDataMap = (val: QueryData): val is QueryDataMap =>
  !!val && !(val instanceof Value) && !Array.isArray(val);

/**
 * Guard for TupleQueryData
 */
export const isTupleQueryData = (val: QueryData): val is TupleQueryData =>
  !!val && Array.isArray(val);

/**
 * Runs `f` on each `Value` held in the QueryData, mapping it and
 * returning it in the original shape
 */
export const mapQueryData = <T>(data: QueryData, f: (data: Value) => T): any =>
  deepMap(data, el => el instanceof Value, f);

/**
 * Runs `f` on each `Value` held in the QueryData, mapping it and
 * returning it in the original shape
 */
export const flattenQueryData = (data: QueryData): Array<Value> => {
  const allValues: Value[] = [];

  deepMap(
    data,
    data => {
      if (data instanceof Value) {
        allValues.push(data);
        return true;
      } else {
        return false;
      }
    },
    () => undefined,
  );

  return allValues;
};

/**
 * Merges `input` and `output` according to the QueryData merging rules
 */
export const mergeQueryData = (input: QueryData, output: QueryData): QueryData =>
  isQueryDataMap(input) && isQueryDataMap(output)
    ? { ...input, ...output }
    : output === undefined
      ? input
      : output;
/**
 * Merges `TInput` and `TOutput` according to the QueryData merging rules
 */
export type MergeQueryData<
  TInput extends QueryData,
  TOutput extends QueryData,
> = TOutput extends void
  ? TInput extends void // not sure why but this conditional is needed for some cases
    ? void
    : TInput
  : TOutput extends Value | TupleQueryData
    ? TOutput
    : TOutput extends QueryDataMap
      ? TInput extends QueryDataMap
        ? Id<Omit<TInput, keyof TOutput> & TOutput>
        : TOutput
      : never;

/**
 * Extracts the type that executing the query will output
 */
export type GetQueryDataOutputType<TData extends QueryData> = TData extends Value
  ? GetValueOutputType<TData>
  : TData extends QueryDataMap
    ? { [K in keyof TData]: GetQueryDataOutputType<TData[K]> }
    : TData extends [infer T1 extends Value, infer T2 extends Value]
      ? [GetValueOutputType<T1>, GetValueOutputType<T2>]
      : never;

export type ValueFromQueryData<T extends QueryData> = T extends Value
  ? T
  : T extends void
    ? Null
    : T extends QueryDataMap
      ? Map<{ [K in keyof T]: ValueFromQueryData<T[K]> }>
      : T extends [infer T1 extends Value, infer T2 extends Value]
        ? Pair<T1, T2>
        : T extends [infer T1 extends Value, infer T2 extends Value, infer T3 extends Value]
          ? Triple<T1, T2, T3>
          : never;

/**
 *  Recursively makes each element of a QueryData optional
 */
export type MakeQueryDataOptional<T extends QueryData> = T extends Value
  ? MakeOptional<T>
  : T extends QueryDataMap
    ? { [K in keyof T]: MakeQueryDataOptional<T[K]> }
    : T extends [infer TValueA extends Value]
      ? [MakeQueryDataOptional<TValueA>]
      : T extends [infer TValueA extends Value, infer TValueB extends Value]
        ? [MakeQueryDataOptional<TValueA>, MakeQueryDataOptional<TValueB>]
        : T extends [
              infer TValueA extends Value,
              infer TValueB extends Value,
              infer TValueC extends Value,
            ]
          ? [
              MakeQueryDataOptional<TValueA>,
              MakeQueryDataOptional<TValueB>,
              MakeQueryDataOptional<TValueC>,
            ]
          : void;
