import { FlatNarrow } from "@utils/FlatNarrow";
import { $unionSubquery } from "@cypher/stages/$unionSubquery";
import { GetQueryCardinality, GetQueryData, Query, query_untyped } from "@core/query";

export const union = <T extends Array<Query<any, any>>>(
  ...queries: FlatNarrow<T>
): Query<
  {
    [I in keyof T]: GetQueryData<T[I]>;
  }[number],
  GetCardinality<T>
> => query_untyped(() => $unionSubquery("@", queries));

type GetCardinality<T extends Array<Query<any, any>>> = "many" extends {
  [I in keyof T]: GetQueryCardinality<T[I]>;
}[number]
  ? "many"
  : "none-or-one" extends {
        [I in keyof T]: GetQueryCardinality<T[I]>;
      }[number]
    ? "none-or-one"
    : "one";
