import { QueryBuildState } from "neo4j-querier/build/query-build-state";

export const CurrentBuildState = {
  current: null as null | QueryBuildState,
};

export const getBuildState = (functionName: string) => {
  const buildState = CurrentBuildState.current;
  if (!buildState)
    throw new Error(
      `attempted to use '${functionName}' outside of a query operation 'resolve' function`,
    );
  return buildState;
};
