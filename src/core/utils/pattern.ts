import { MatchPattern } from "@core";

/**
 * Extracts the first generic parameter 'TData' of the Pattern<TData, TCardinality> type
 */
export type GetPatternData<TPattern extends MatchPattern<any, any>> =
  TPattern extends MatchPattern<infer TData, any> ? TData : never;

/**
 * Extracts the second generic parameter 'TCardinality' of the Pattern<TData, TCardinality> type
 */
export type GetPatternCardinality<TPattern extends MatchPattern<any, any>> =
  TPattern extends MatchPattern<any, infer TCardinality>
    ? TCardinality extends "many"
      ? "many"
      : "one"
    : never;
