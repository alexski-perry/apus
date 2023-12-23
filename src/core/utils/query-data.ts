import {
  Value,
  EmptyQueryData,
  isObjectQueryData,
  isValueQueryData,
  ObjectQueryData,
  QueryData,
  TupleQueryData,
  ValueQueryData,
} from "@core";
import { Id } from "@utils/Id";
import { deepMap } from "@utils/deepMap";

/**
 * Runs `mapF` on each `Value` held in the QueryData, mapping it and
 * returning it in the original shape
 */
export const mapQueryData = <T>(data: QueryData, mapF: (data: Value) => T): any =>
  deepMap(data, el => isValueQueryData(el), mapF);

/**
 * Flattens `data` into a flat list of type `Value`
 */
// export const flattenQueryData = (data: QueryData): Array<Value> => {
//   const flattenedData: Value[] = [];
//   mapQueryData(data, val => flattenedData.push(val));
//   return flattenedData;
// };

/**
 * Merges `input` and `output` according to the QueryData merging rules
 */
export const mergeQueryData = (input: QueryData, output: QueryData): QueryData =>
  isObjectQueryData(input) && isObjectQueryData(output)
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
> = TOutput extends EmptyQueryData
  ? TInput extends void // not sure why but this conditional is needed for some cases
    ? void
    : TInput
  : TOutput extends ValueQueryData | TupleQueryData
  ? TOutput
  : TOutput extends ObjectQueryData
  ? TInput extends ObjectQueryData
    ? Id<Omit<TInput, keyof TOutput> & TOutput>
    : TOutput
  : never;

/**
 * Extracts the type that executing the query will output
 */
export type QueryDataOutput<TData extends QueryData> = TData extends Value<any, infer X>
  ? X
  : TData extends ObjectQueryData
  ? { [K in keyof TData]: QueryDataOutput<TData[K]> }
  : TData extends TupleQueryData
  ? {
      // @ts-ignore
      [I in keyof TData]: QueryDataOutput<TData[I]>;
    }
  : never;

/**
 * Extracts the type that would need to be input to create this query data
 */
export type QueryDataInput<TData extends QueryData> = TData extends Value<infer X>
  ? X
  : TData extends ObjectQueryData
  ? { [K in keyof TData]: QueryDataInput<TData[K]> }
  : TData extends TupleQueryData
  ? {
      // @ts-ignore
      [I in keyof TData]: QueryDataInput<TData[I]>;
    }
  : never;
