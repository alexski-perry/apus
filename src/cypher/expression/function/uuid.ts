import { expression } from "@core/expression";
import { ID } from "@cypher/types/scalar/id";

export const uuid = () => expression(ID)`randomUUID()`;
