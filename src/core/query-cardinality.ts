export type QueryCardinality = "one" | "none-or-one" | "one-or-more" | "many";

export type MergeQueryCardinality<
  TIn extends QueryCardinality,
  TOut extends QueryCardinality,
> = {
  one: TIn;
  "none-or-one": {
    one: "none-or-one";
    "none-or-one": "none-or-one";
    "one-or-more": "many"; // can't become 'one-or-more', as we produce no rows
    many: "many";
  }[TIn];
  "one-or-more": {
    one: "one-or-more";
    "one-or-more": "one-or-more";
    // can't be 'one-or-more' in following two cases, as we may not have
    // had any input rows, and thus will remain with no output rows
    "none-or-one": "many";
    many: "many";
  }[TIn];
  many: "many";
}[TOut];
