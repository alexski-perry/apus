import { ID } from "@cypher/types";
import { expression } from "@cypher/expression/core";

export const uuid = () => expression(ID)`randomUUID()`;
