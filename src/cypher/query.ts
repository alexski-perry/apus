import { QueryData, Query } from "@core";

/**
 * The starting point of every query
 * note: a query() can also be used as a subquery, despite its name, it just doesn't
 * allow importing variables, so can exist of its own accord unlike subquery()
 */
export const query = () => {
  return new Query<void, "one">({
    stages: [],
    input: undefined,
  });
};

/**
 * A subquery — allows us to import variables
 */
export const subquery = <T extends QueryData = void>(input?: T): Query<T, "one"> => {
  return new Query<T, "one">({
    stages: [],
    input,
  });
};
