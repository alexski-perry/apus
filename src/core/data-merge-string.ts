export type DataMergeString = Identifier | RootMerge | Ignored;

export const ROOT_MERGE = "@" as const;
export type RootMerge = typeof ROOT_MERGE;

export const IGNORED = "_" as const;
export type Ignored = typeof IGNORED;

export type Identifier = `:${string}`;

export type ExtractIdentifier<T extends Identifier> = T extends `:${infer X extends string}`
  ? X
  : never;

export const applyDataMergeString = <T>(
  ref: DataMergeString,
  val: T,
): T | Record<string, T> | undefined => {
  return ref.startsWith(":")
    ? {
        [ref.substring(1)]: val,
      }
    : ref === "@"
    ? val
    : undefined;
};

export type ApplyDataMergeString<TRef extends DataMergeString, TData> = TRef extends Identifier
  ? { [_ in ExtractIdentifier<TRef>]: TData }
  : TRef extends "@"
  ? TData
  : void;
