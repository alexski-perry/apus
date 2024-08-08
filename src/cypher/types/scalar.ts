import { Value } from "@core/value";

export abstract class ScalarValue<TTag, TInput, TOutput> extends Value<
  ["Scalar", TTag],
  TInput,
  TOutput
> {}
