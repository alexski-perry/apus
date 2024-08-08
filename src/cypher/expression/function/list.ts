import { expression } from "@core/expression";
import { List } from "@cypher/types/list";
import { StringValue } from "@cypher/types/scalar/string";
import { Int } from "@cypher/types/scalar/int";

export const length = (value: List<any> | StringValue<any>) =>
  expression(Int)`length(${value})`;
