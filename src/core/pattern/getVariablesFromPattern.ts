import { QueryData } from "@core/query-data";
import { Value } from "@core/value";
import { MatchPattern } from "@core/pattern/match-pattern";
import { CreationPattern } from "@core/pattern/creation-pattern";

export const getVariablesFromPattern = (
  pattern: MatchPattern<any, any> | CreationPattern<any>,
): QueryData => {
  let i = 0;
  const output: Record<string, Value> = {};

  const { parts } =
    pattern instanceof MatchPattern
      ? MatchPattern.getData(pattern)
      : CreationPattern.getData(pattern);

  parts.forEach(part => {
    if (part.value instanceof Value) {
      output[`key${i++}`] = part.value;
    }
  });

  return Object.keys(output).length > 0 ? output : undefined;
};
