import { List } from "@cypher/types";
import { Int, StringValue } from "@cypher/types";
import { expression } from "@cypher/expression/core";

export const length = (value: List<any> | StringValue<any>) => {
  return expression(Int)`length(${value})`;
};
