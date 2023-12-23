import { Value } from "@core";

export type QueryData = EmptyQueryData | ValueQueryData | ObjectQueryData | TupleQueryData;

export type EmptyQueryData = void;
export type ValueQueryData = Value;
export type TupleQueryData =
  | [ValueQueryData, ValueQueryData]
  | [ValueQueryData, ValueQueryData, ValueQueryData];

export type ObjectQueryData = {
  [key: string]: ValueQueryData | ObjectQueryData;
};

export type NonEmptyQueryData = Exclude<QueryData, EmptyQueryData>;

/*
  GUARDS
 */

export const isEmptyQueryData = (val: QueryData): val is EmptyQueryData => !val;

export const isObjectQueryData = (val: QueryData): val is ObjectQueryData =>
  !!val && !(val instanceof Value) && !Array.isArray(val);

export const isValueQueryData = (val: QueryData): val is ValueQueryData =>
  !!val && val instanceof Value;

export const isTupleQueryData = (val: QueryData): val is TupleQueryData =>
  !!val && Array.isArray(val);
