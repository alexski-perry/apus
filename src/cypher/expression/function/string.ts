import { expression } from "@core/expression";
import { ValueOrInputType } from "@core/value";
import { StringValue, String } from "@cypher/types/scalar/string";
import { Boolean } from "@cypher/types/scalar/boolean";
import { parameterize } from "@core/parameterize";

export const toUpper = (value: StringValue): String => expression(String)`toUpper(${value})`;

export const toLower = (value: StringValue): String => expression(String)`toLower(${value})`;

// TODO: check this works — see https://neo4j.com/docs/cypher-manual/current/clauses/where/
export const matchesRegex = (
  value: StringValue,
  regex: ValueOrInputType<StringValue> | RegExp,
): Boolean => {
  const regexValue = parameterize(
    regex instanceof RegExp ? regex.toString() : regex,
    StringValue,
  );
  return expression(Boolean)`${value} ~= ${regexValue}`;
};

// isGreaterThan(other: OrConstant<String>) {
//   const otherExpr = PropertyTypeValue.parameterize(String, other);
//   return PropertyTypeValue.createFromTemplate(Boolean)`${this} > ${otherExpr}`;
// }
//
// isLessThan(other: OrConstant<String>) {
//   const otherExpr = PropertyTypeValue.parameterize(String, other);
//   return PropertyTypeValue.createFromTemplate(Boolean)`${this} < ${otherExpr}`;
// }
//
// isGreaterThanEq(other: OrConstant<String>) {
//   const otherExpr = PropertyTypeValue.parameterize(String, other);
//   return PropertyTypeValue.createFromTemplate(Boolean)`${this} >= ${otherExpr}`;
// }
//
// isLessThanEq(other: OrConstant<String>) {
//   const otherExpr = PropertyTypeValue.parameterize(String, other);
//   return PropertyTypeValue.createFromTemplate(Boolean)`${this} <= ${otherExpr}`;
// }
//
// isBetween(lower: OrConstant<String>, upper: OrConstant<String>) {
//   const lowerExpr = PropertyTypeValue.parameterize(String, lower);
//   const upperExpr = PropertyTypeValue.parameterize(String, upper);
//   return PropertyTypeValue.createFromTemplate(Boolean)`${lowerExpr} < ${this} < ${upperExpr}`;
// }
//
// isBetweenEq(lower: OrConstant<String>, upper: OrConstant<String>) {
//   const lowerExpr = PropertyTypeValue.parameterize(String, lower);
//   const upperExpr = PropertyTypeValue.parameterize(String, upper);
//   return PropertyTypeValue.createFromTemplate(Boolean)`${lowerExpr} <= ${this} <= ${upperExpr}`;
// }
//
// left(length: OrConstant<Int>) {
//   const lengthExpr = PropertyTypeValue.parameterize(Int, length);
//   return PropertyTypeValue.createFromTemplate(String)`left(${this}, ${lengthExpr})`;
// }
//
// right(length: OrConstant<Int>) {
//   const lengthExpr = PropertyTypeValue.parameterize(Int, length);
//   return PropertyTypeValue.createFromTemplate(String)`right(${this}, ${lengthExpr})`;
// }
//
// // todo check whether null for the last parameter is really the same as not providing it
// substring(start: OrConstant<Int>, length?: OrNullableConstant<Int>) {
//   const startExpr = PropertyTypeValue.parameterize(Int, start);
//   const lengthExpr = PropertyTypeValue.parameterize(Int, length ?? null);
//   return PropertyTypeValue.createFromTemplate(
//     String
//   )`substring(${this}, ${startExpr}, ${lengthExpr})`;
// }
//
// ltrim() {
//   return PropertyTypeValue.createFromTemplate(String)`ltrim(${this})`;
// }
//
// rtrim() {
//   return PropertyTypeValue.createFromTemplate(String)`rtrim(${this})`;
// }
//
// trim() {
//   return PropertyTypeValue.createFromTemplate(String)`trim(${this})`;
// }
//
// replace(search: OrConstant<String>, replace: OrConstant<String>) {
//   const searchExpr = PropertyTypeValue.parameterize(String, search);
//   const replaceExpr = PropertyTypeValue.parameterize(String, replace);
//   return PropertyTypeValue.createFromTemplate(
//     String
//   )`replace(${this}, ${searchExpr}, ${replaceExpr})`;
// }
//
// reverse() {
//   return PropertyTypeValue.createFromTemplate(String)`reverse(${this})`;
// }
//
// split(delimiter: OrConstant<String>) {
//   const delimiterExpr = PropertyTypeValue.parameterize(String, delimiter);
//   return PropertyTypeValue.createFromTemplate(List.of(String))`split(${this}, ${delimiterExpr})`;
// }
//
// toUpper() {
//   return PropertyTypeValue.createFromTemplate(String)`toUpper(${this})`;
// }
//
