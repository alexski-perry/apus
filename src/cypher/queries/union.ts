import { GetQueryCardinality, GetQueryData, Query } from "@core";
import { FlatNarrow } from "@utils/FlatNarrow";
import { query } from "@cypher/query";
import { $unionSubquery } from "@cypher/stages/$unionSubquery";

export const union = <T extends Array<Query<any, any>>>(
  ...queries: FlatNarrow<T>
): Query<
  {
    [I in keyof T]: GetQueryData<T[I]>;
  }[number],
  GetCardinality<T>
> => query().pipe(() => $unionSubquery("@", queries)) as Query<any, any>;

type GetCardinality<T extends Array<Query<any, any>>> = "many" extends {
  [I in keyof T]: GetQueryCardinality<T[I]>;
}[number]
  ? "many"
  : "none-or-one" extends {
        [I in keyof T]: GetQueryCardinality<T[I]>;
      }[number]
    ? "none-or-one"
    : "one";
