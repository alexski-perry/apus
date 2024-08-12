import { Date } from "@cypher/types/scalar/date";
import { StringValue } from "@cypher/types/scalar/string";
import { expression } from "@core/expression";
import { DateTime } from "@cypher/types/scalar/date-time";
import { LocalDateTime } from "@cypher/types/scalar/local-date-time";

export const now = () => expression(Date)`now()`;

export function toDate(date: Date | StringValue | DateTime | LocalDateTime) {
  return expression(Date)`date(${date})`;
}
