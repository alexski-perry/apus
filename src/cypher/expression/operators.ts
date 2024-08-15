import { Value, ValueOrInputType } from "@core/value";
import { expression, expressionDynamic } from "@core/expression";
import { Type } from "@core/type/type";
import { Int, IntValue } from "@cypher/types/scalar/int";
import { Float, FloatValue } from "@cypher/types/scalar/float";
import { Boolean, BooleanValue } from "@cypher/types/scalar/boolean";
import { String, StringValue } from "@cypher/types/scalar/string";
import { NodeValue } from "@cypher/types/structural/node";
import { Optional } from "@cypher/types/optional";
import { List } from "@cypher/types/list";
import { makeParam } from "@core/makeParam";

/*
  MATHS OPERATIONS
 */

export const add = <
  T1 extends IntValue<any> | FloatValue<any>,
  T2 extends IntValue<any> | FloatValue<any>,
>(
  val1: T1,
  val2: T2,
): T1 extends FloatValue<any> ? Float : T2 extends FloatValue<any> ? Float : Int => {
  const outputType: Type =
    val1 instanceof FloatValue || val2 instanceof FloatValue ? Float : Int;
  return expression(outputType)`(${val1} + ${val2})` as any;
};

export const minus = <
  T1 extends IntValue<any> | FloatValue<any>,
  T2 extends IntValue<any> | FloatValue<any>,
>(
  val1: T1,
  val2: T2,
): T1 extends FloatValue<any> ? Float : T2 extends FloatValue<any> ? Float : Int => {
  const outputType: Type =
    val1 instanceof FloatValue || val2 instanceof FloatValue ? Float : Int;
  return expression(outputType)`(${val1} - ${val2})` as any;
};

export const multiply = <
  T1 extends IntValue<any> | FloatValue<any>,
  T2 extends IntValue<any> | FloatValue<any>,
>(
  val1: T1,
  val2: T2,
): T1 extends FloatValue<any> ? Float : T2 extends FloatValue<any> ? Float : Int => {
  const outputType: Type =
    val1 instanceof FloatValue || val2 instanceof FloatValue ? Float : Int;
  return expression(outputType)`(${val1} * ${val2})` as any;
};

export const divide = <
  T1 extends IntValue<any> | FloatValue<any>,
  T2 extends IntValue<any> | FloatValue<any>,
>(
  val1: T1,
  val2: T2,
): T1 extends FloatValue<any> ? Float : T2 extends FloatValue<any> ? Float : Int => {
  const outputType: Type =
    val1 instanceof FloatValue || val2 instanceof FloatValue ? Float : Int;
  return expression(outputType)`(${val1} / ${val2})` as any;
};

export const modulo = <
  T1 extends IntValue<any> | FloatValue<any>,
  T2 extends IntValue<any> | FloatValue<any>,
>(
  val1: T1,
  val2: T2,
): T1 extends FloatValue<any> ? Float : T2 extends FloatValue<any> ? Float : Int => {
  const outputType: Type =
    val1 instanceof FloatValue || val2 instanceof FloatValue ? Float : Int;
  return expression(outputType)`(${val1} % ${val2})` as any;
};

export const exponentiate = <
  T1 extends IntValue<any> | FloatValue<any>,
  T2 extends IntValue<any> | FloatValue<any>,
>(
  num: T1,
  exponent: T2,
): T1 extends FloatValue<any> ? Float : T2 extends FloatValue<any> ? Float : Int => {
  const outputType: Type =
    num instanceof FloatValue || exponent instanceof FloatValue ? Float : Int;
  return expression(outputType)`(${num} ^ ${exponent})` as any;
};

export const negate = <T1 extends IntValue<any> | FloatValue<any>>(
  num: T1,
): T1 extends FloatValue<any> ? Float : Int => {
  const outputType: Type = num instanceof FloatValue ? Float : Int;
  return expression(outputType)`-${num}` as any;
};

/*
  COMPARISON OPERATORS
 */

export const equals = <T extends Value>(a: T, b: ValueOrInputType<T>): Boolean => {
  const bParametrized = makeParam(b);
  return expression(Boolean)`${a} = ${bParametrized}`;
};

export const equals_weak = (a: Value, b: Value): Boolean => {
  return expression(Boolean)`${a} = ${b}`;
};

export const notEquals = <T extends Value>(a: T, b: ValueOrInputType<T>): Boolean => {
  const bParametrized = makeParam(b);
  return expression(Boolean)`${a} <> ${bParametrized}`;
};

export const notEquals_weak = (a: Value, b: Value): Boolean => {
  return expression(Boolean)`${a} <> ${b}`;
};

export const greaterThan = (
  val: IntValue<any> | FloatValue<any>,
  check: ValueOrInputType<IntValue<any> | FloatValue<any>>,
): Boolean => {
  const checkParametrized = makeParam(check);
  return expression(Boolean)`(${val} > ${checkParametrized})`;
};

export const lessThan = (
  val: IntValue<any> | FloatValue<any>,
  check: ValueOrInputType<IntValue<any> | FloatValue<any>>,
): Boolean => {
  const checkParametrized = makeParam(check);
  return expression(Boolean)`(${val} < ${checkParametrized})`;
};

export const greaterThanEq = (
  val: IntValue<any> | FloatValue<any>,
  check: ValueOrInputType<IntValue<any> | FloatValue<any>>,
): Boolean => {
  const checkParametrized = makeParam(check);
  return expression(Boolean)`(${val} >= ${checkParametrized})`;
};

export const lessThanEq = (
  val: IntValue<any> | FloatValue<any>,
  check: ValueOrInputType<IntValue<any> | FloatValue<any>>,
): Boolean => {
  const checkParametrized = makeParam(check);
  return expression(Boolean)`(${val} <= ${checkParametrized})`;
};

export const between = (
  val: IntValue<any> | FloatValue<any>,
  lower: ValueOrInputType<IntValue<any> | FloatValue<any>>,
  upper: ValueOrInputType<IntValue<any> | FloatValue<any>>,
): Boolean => {
  const lowerParametrized = makeParam(lower);
  const upperParametrized = makeParam(upper);
  return expression(Boolean)`(${lowerParametrized} < ${val} < ${upperParametrized})`;
};

export const betweenEq = (
  val: IntValue<any> | FloatValue<any>,
  lower: ValueOrInputType<IntValue<any> | FloatValue<any>>,
  upper: ValueOrInputType<IntValue<any> | FloatValue<any>>,
): Boolean => {
  const lowerParametrized = makeParam(lower);
  const upperParametrized = makeParam(upper);
  return expression(Boolean)`(${lowerParametrized} <= ${val} <= ${upperParametrized})`;
};

export const isNotNull = (val: Value): Boolean => expression(Boolean)`${val} IS NOT NULL`;
export const isNull = (a: Value): Boolean => expression(Boolean)`${a} IS NULL`;

export const hasLabel = (node: NodeValue | Optional<NodeValue>, label: string): Boolean =>
  expression(Boolean)`${node}:${label}`;

export const inList = <T extends Value>(
  value: ValueOrInputType<T | Optional<T>>,
  list: ValueOrInputType<List<T>>,
) => {
  const valueExpr = makeParam(value);
  const listExpr = makeParam(list);
  return expression(Boolean)`${valueExpr} IN ${listExpr}`;
};

/*
  STRING COMPARISON OPERATORS
 */

export const startsWith = (
  value: StringValue,
  targetPrefix: ValueOrInputType<StringValue>,
): Boolean => {
  const targetPrefixParametrized = makeParam(targetPrefix, String);
  return expression(Boolean)`${value} STARTS WITH ${targetPrefixParametrized}`;
};

export const endsWith = (
  value: StringValue,
  targetSuffix: ValueOrInputType<StringValue>,
): Boolean => {
  const targetSuffixParametrized = makeParam(targetSuffix, String);
  return expression(Boolean)`${value} ENDS WITH ${targetSuffixParametrized}`;
};

export const contains = (
  value: StringValue,
  target: ValueOrInputType<StringValue>,
): Boolean => {
  const targetParametrized = makeParam(target, String);
  return expression(Boolean)`${value} CONTAINS ${targetParametrized}`;
};

export const startsWithCI = (
  value: StringValue,
  targetPrefix: ValueOrInputType<StringValue>,
): Boolean => {
  const targetPrefixParametrized = makeParam(targetPrefix, String);
  return expression(
    Boolean,
  )`toLower(${value}) STARTS WITH toLower(${targetPrefixParametrized})`;
};

export const endsWithCI = (
  value: StringValue,
  targetSuffix: ValueOrInputType<StringValue>,
): Boolean => {
  const targetSuffixParametrized = makeParam(targetSuffix, String);
  return expression(Boolean)`toLower(${value}) ENDS WITH toLower(${targetSuffixParametrized})`;
};

export const containsCI = (
  value: StringValue,
  target: ValueOrInputType<StringValue>,
): Boolean => {
  const targetParametrized = makeParam(target, String);
  return expression(Boolean)`toLower(${value}) CONTAINS toLower(${targetParametrized})`;
};

export const string_greaterThan = (
  val: StringValue,
  check: ValueOrInputType<StringValue>,
): Boolean => {
  const checkParametrized = makeParam(check, StringValue);
  return expression(Boolean)`(${val} > ${checkParametrized})`;
};

export const string_lessThan = (
  val: StringValue,
  check: ValueOrInputType<StringValue>,
): Boolean => {
  const checkParametrized = makeParam(check, StringValue);
  return expression(Boolean)`(${val} < ${checkParametrized})`;
};

export const string_greaterThanEq = (
  val: StringValue,
  check: ValueOrInputType<StringValue>,
): Boolean => {
  const checkParametrized = makeParam(check, StringValue);
  return expression(Boolean)`(${val} >= ${checkParametrized})`;
};

export const string_lessThanEq = (
  val: StringValue,
  check: ValueOrInputType<StringValue>,
): Boolean => {
  const checkParametrized = makeParam(check, StringValue);
  return expression(Boolean)`(${val} <= ${checkParametrized})`;
};

export const string_between = (
  val: StringValue,
  lower: ValueOrInputType<StringValue>,
  upper: ValueOrInputType<StringValue>,
): Boolean => {
  const lowerParametrized = makeParam(lower, StringValue);
  const upperParametrized = makeParam(upper, StringValue);
  return expression(Boolean)`(${lowerParametrized} < ${val} < ${upperParametrized})`;
};

export const string_betweenEq = (
  val: StringValue,
  lower: ValueOrInputType<StringValue>,
  upper: ValueOrInputType<StringValue>,
): Boolean => {
  const lowerParametrized = makeParam(lower, StringValue);
  const upperParametrized = makeParam(upper, StringValue);
  return expression(Boolean)`(${lowerParametrized} <= ${val} <= ${upperParametrized})`;
};

/*
  BOOLEAN OPERATORS
 */

export const and = (...values: BooleanValue<any>[]): Boolean => {
  return expressionDynamic(Boolean, expr => {
    if (values.length === 0) return [expr`true`];
    return values.map((value, i) => (i === 0 ? expr`${value}` : expr` AND ${value}`));
  });
};

export const or = (...values: BooleanValue<any>[]): Boolean => {
  return expressionDynamic(Boolean, expr => {
    if (values.length === 0) return [expr`true`];
    return values.map((value, i) => (i === 0 ? expr`${value}` : expr` OR ${value}`));
  });
};
export const xor = (a: BooleanValue<any>, b: BooleanValue<any>): Boolean =>
  expression(Boolean)`(${a} XOR ${b})`;

export const not = (val: BooleanValue<any>): Boolean => expression(Boolean)`NOT ${val}`;

/*
  STRING OPERATORS
 */

export const concat = (
  a: ValueOrInputType<StringValue>,
  b: ValueOrInputType<StringValue>,
): String => {
  const aParametrized = makeParam(a, String);
  const bParametrized = makeParam(b, String);
  return expression(String)`${aParametrized} + ${bParametrized}`;
};
