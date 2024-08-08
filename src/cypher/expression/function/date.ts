import { Date } from "@cypher/types/scalar/date";
import { expression } from "@core/expression";

export const now = () => expression(Date)`now()`;
