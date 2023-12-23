import { Date } from "@cypher/types";
import { expression } from "@cypher/expression/core";

export const now = () => expression(Date)`now()`;
