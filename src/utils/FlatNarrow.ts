import { Narrowable } from "ts-toolbelt/out/Function/_Internal";

export type FlatNarrow<A> =
  | (A extends [] ? [] : never)
  | (A extends Narrowable ? A : never)
  | {
      [K in keyof A]: A[K] extends Function ? A[K] : A[K];
    };
