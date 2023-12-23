import { Value } from "@core/value";
import {
  AllowedPropertyValue,
  Boolean,
  BooleanValue,
  Float,
  FloatValue,
  GraphNode,
  Int,
  IntValue,
  NodeUnionValue,
  NodeValue,
  RelationshipValue,
  String,
  StringValue,
} from "@cypher/types";
import { ValueOrInputType } from "@core/utils/value";
import { List, Optional } from "@cypher/types";
import { AnyProperty } from "@cypher/types/property-types/any-property";
import { parameterize } from "@cypher/expression/param";
import { expression } from "@cypher/expression/core";
import { Type, TypeOf } from "@core/type";
import { NodeLikeDefinition } from "@schema/definition";
import { loadNodeLikeModel } from "@schema/models";
import { Property } from "@schema/property";

/*
  MATHS OPERATIONS
 */

export const add = <
  T1 extends IntValue<any, any> | FloatValue<any>,
  T2 extends IntValue<any, any> | FloatValue<any>,
>(
  val1: T1,
  val2: T2,
): T1 extends FloatValue<any> ? Float : T2 extends FloatValue<any> ? Float : Int => {
  const outputType: Type =
    val1 instanceof FloatValue || val2 instanceof FloatValue ? Float : Int;
  return expression(outputType)`(${val1} + ${val2})` as any;
};

export const minus = <
  T1 extends IntValue<any, any> | FloatValue<any>,
  T2 extends IntValue<any, any> | FloatValue<any>,
>(
  val1: T1,
  val2: T2,
): T1 extends FloatValue<any> ? Float : T2 extends FloatValue<any> ? Float : Int => {
  const outputType: Type =
    val1 instanceof FloatValue || val2 instanceof FloatValue ? Float : Int;
  return expression(outputType)`(${val1} - ${val2})` as any;
};

export const multiply = <
  T1 extends IntValue<any, any> | FloatValue<any>,
  T2 extends IntValue<any, any> | FloatValue<any>,
>(
  val1: T1,
  val2: T2,
): T1 extends FloatValue<any> ? Float : T2 extends FloatValue<any> ? Float : Int => {
  const outputType: Type =
    val1 instanceof FloatValue || val2 instanceof FloatValue ? Float : Int;
  return expression(outputType)`(${val1} * ${val2})` as any;
};

export const divide = <
  T1 extends IntValue<any, any> | FloatValue<any>,
  T2 extends IntValue<any, any> | FloatValue<any>,
>(
  val1: T1,
  val2: T2,
): T1 extends FloatValue<any> ? Float : T2 extends FloatValue<any> ? Float : Int => {
  const outputType: Type =
    val1 instanceof FloatValue || val2 instanceof FloatValue ? Float : Int;
  return expression(outputType)`(${val1} / ${val2})` as any;
};

export const modulo = <
  T1 extends IntValue<any, any> | FloatValue<any>,
  T2 extends IntValue<any, any> | FloatValue<any>,
>(
  val1: T1,
  val2: T2,
): T1 extends FloatValue<any> ? Float : T2 extends FloatValue<any> ? Float : Int => {
  const outputType: Type =
    val1 instanceof FloatValue || val2 instanceof FloatValue ? Float : Int;
  return expression(outputType)`(${val1} % ${val2})` as any;
};

export const exponentiate = <
  T1 extends IntValue<any, any> | FloatValue<any>,
  T2 extends IntValue<any, any> | FloatValue<any>,
>(
  num: T1,
  exponent: T2,
): T1 extends FloatValue<any> ? Float : T2 extends FloatValue<any> ? Float : Int => {
  const outputType: Type =
    num instanceof FloatValue || exponent instanceof FloatValue ? Float : Int;
  return expression(outputType)`(${num} ^ ${exponent})` as any;
};

export const negate = <T1 extends IntValue<any, any> | FloatValue<any>>(
  num: T1,
): T1 extends FloatValue<any> ? Float : Int => {
  const outputType: Type = num instanceof FloatValue ? Float : Int;
  return expression(outputType)`-${num}` as any;
};

/*
  COMPARISON OPERATORS
 */

export const equals = <T extends Value>(a: T, b: ValueOrInputType<T>): Boolean => {
  const bParametrized = parameterize(b, AnyProperty);
  return expression(Boolean)`${a} = ${bParametrized}`;
};

export const equals_weak = (a: Value, b: Value): Boolean => {
  return expression(Boolean)`${a} = ${b}`;
};

export const notEquals = <T extends Value>(a: T, b: ValueOrInputType<T>): Boolean => {
  const bParametrized = parameterize(b, AnyProperty);
  return expression(Boolean)`${a} <> ${bParametrized}`;
};

export const notEquals_weak = (a: Value, b: Value): Boolean => {
  return expression(Boolean)`${a} <> ${b}`;
};

export const greaterThan = (
  val: IntValue<any, any> | FloatValue<any>,
  check: ValueOrInputType<IntValue<any, any> | FloatValue<any>>,
): Boolean => {
  const checkParametrized = parameterize(check, AnyProperty);
  return expression(Boolean)`(${val} > ${checkParametrized})`;
};

export const lessThan = (
  val: IntValue<any, any> | FloatValue<any>,
  check: ValueOrInputType<IntValue<any, any> | FloatValue<any>>,
): Boolean => {
  const checkParametrized = parameterize(check, AnyProperty);
  return expression(Boolean)`(${val} < ${checkParametrized})`;
};

export const greaterThanEq = (
  val: IntValue<any, any> | FloatValue<any>,
  check: ValueOrInputType<IntValue<any, any> | FloatValue<any>>,
): Boolean => {
  const checkParametrized = parameterize(check, AnyProperty);
  return expression(Boolean)`(${val} >= ${checkParametrized})`;
};

export const lessThanEq = (
  val: IntValue<any, any> | FloatValue<any>,
  check: ValueOrInputType<IntValue<any, any> | FloatValue<any>>,
): Boolean => {
  const checkParametrized = parameterize(check, AnyProperty);
  return expression(Boolean)`(${val} <= ${checkParametrized})`;
};

export const between = (
  val: IntValue<any, any> | FloatValue<any>,
  lower: ValueOrInputType<IntValue<any, any> | FloatValue<any>>,
  upper: ValueOrInputType<IntValue<any, any> | FloatValue<any>>,
): Boolean => {
  const lowerParametrized = parameterize(lower, AnyProperty);
  const upperParametrized = parameterize(upper, AnyProperty);
  return expression(Boolean)`(${lowerParametrized} < ${val} < ${upperParametrized})`;
};

export const betweenEq = (
  val: IntValue<any, any> | FloatValue<any>,
  lower: ValueOrInputType<IntValue<any, any> | FloatValue<any>>,
  upper: ValueOrInputType<IntValue<any, any> | FloatValue<any>>,
): Boolean => {
  const lowerParametrized = parameterize(lower, AnyProperty);
  const upperParametrized = parameterize(upper, AnyProperty);
  return expression(Boolean)`(${lowerParametrized} <= ${val} <= ${upperParametrized})`;
};

export const isNotNull = (val: Value): Boolean => expression(Boolean)`${val} IS NOT NULL`;
export const isNull = (a: Value): Boolean => expression(Boolean)`${a} IS NULL`;

export const hasLabel = (
  node: NodeValue | NodeUnionValue | Optional<NodeValue | NodeUnionValue>,
  label: string,
): Boolean => expression(Boolean)`${node}:${label}`;

export const inList = <T extends Value>(
  value: ValueOrInputType<T | Optional<T>>,
  list: ValueOrInputType<List<T>>,
) => {
  const valueExpr = parameterize(value, AnyProperty);
  const listExpr = parameterize(list, AnyProperty);
  return expression(Boolean)`${valueExpr} IN ${listExpr}`;
};

/*
  STRING COMPARISON OPERATORS
 */

export const startsWith = (
  value: StringValue,
  targetPrefix: ValueOrInputType<StringValue>,
): Boolean => {
  const targetPrefixParametrized = parameterize(targetPrefix, String);
  return expression(Boolean)`${value} STARTS WITH ${targetPrefixParametrized}`;
};

export const endsWith = (
  value: StringValue,
  targetSuffix: ValueOrInputType<StringValue>,
): Boolean => {
  const targetSuffixParametrized = parameterize(targetSuffix, String);
  return expression(Boolean)`${value} ENDS WITH ${targetSuffixParametrized}`;
};

export const contains = (
  value: StringValue,
  target: ValueOrInputType<StringValue>,
): Boolean => {
  const targetParametrized = parameterize(target, String);
  return expression(Boolean)`${value} CONTAINS ${targetParametrized}`;
};

export const startsWithCI = (
  value: StringValue,
  targetPrefix: ValueOrInputType<StringValue>,
): Boolean => {
  const targetPrefixParametrized = parameterize(targetPrefix, String);
  return expression(
    Boolean,
  )`toLower(${value}) STARTS WITH toLower(${targetPrefixParametrized})`;
};

export const endsWithCI = (
  value: StringValue,
  targetSuffix: ValueOrInputType<StringValue>,
): Boolean => {
  const targetSuffixParametrized = parameterize(targetSuffix, String);
  return expression(Boolean)`toLower(${value}) ENDS WITH toLower(${targetSuffixParametrized})`;
};

export const containsCI = (
  value: StringValue,
  target: ValueOrInputType<StringValue>,
): Boolean => {
  const targetParametrized = parameterize(target, String);
  return expression(Boolean)`toLower(${value}) CONTAINS toLower(${targetParametrized})`;
};

export const string_greaterThan = (
  val: StringValue,
  check: ValueOrInputType<StringValue>,
): Boolean => {
  const checkParametrized = parameterize(check, StringValue);
  return expression(Boolean)`(${val} > ${checkParametrized})`;
};

export const string_lessThan = (
  val: StringValue,
  check: ValueOrInputType<StringValue>,
): Boolean => {
  const checkParametrized = parameterize(check, StringValue);
  return expression(Boolean)`(${val} < ${checkParametrized})`;
};

export const string_greaterThanEq = (
  val: StringValue,
  check: ValueOrInputType<StringValue>,
): Boolean => {
  const checkParametrized = parameterize(check, StringValue);
  return expression(Boolean)`(${val} >= ${checkParametrized})`;
};

export const string_lessThanEq = (
  val: StringValue,
  check: ValueOrInputType<StringValue>,
): Boolean => {
  const checkParametrized = parameterize(check, StringValue);
  return expression(Boolean)`(${val} <= ${checkParametrized})`;
};

export const string_between = (
  val: StringValue,
  lower: ValueOrInputType<StringValue>,
  upper: ValueOrInputType<StringValue>,
): Boolean => {
  const lowerParametrized = parameterize(lower, StringValue);
  const upperParametrized = parameterize(upper, StringValue);
  return expression(Boolean)`(${lowerParametrized} < ${val} < ${upperParametrized})`;
};

export const string_betweenEq = (
  val: StringValue,
  lower: ValueOrInputType<StringValue>,
  upper: ValueOrInputType<StringValue>,
): Boolean => {
  const lowerParametrized = parameterize(lower, StringValue);
  const upperParametrized = parameterize(upper, StringValue);
  return expression(Boolean)`(${lowerParametrized} <= ${val} <= ${upperParametrized})`;
};

/*
  BOOLEAN OPERATORS
 */

export const and = (a: BooleanValue<any>, b: BooleanValue<any>): Boolean =>
  expression(Boolean)`(${a} AND ${b})`;

export const or = (a: BooleanValue<any>, b: BooleanValue<any>): Boolean =>
  expression(Boolean)`(${a} OR ${b})`;

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
  const aParametrized = parameterize(a, String);
  const bParametrized = parameterize(b, String);
  return expression(String)`${aParametrized} + ${bParametrized}`;
};

/*
  PROPERTY OPERATORS
 */

/**
 *  Property access for a strongly typed node
 */
export const prop = <T extends NodeLikeDefinition, K extends PropertyNames<T>>(
  node: GraphNode<T>,
  key: K,
): GetProp<T, K> => {
  const nodeDef = NodeValue.getDefinition(node);
  if (typeof nodeDef === "string") throw new Error("can't call on prop() on untyped node");
  const model = loadNodeLikeModel(nodeDef);

  const propertyModel = model.properties[key];
  if (propertyModel) {
    return expression(propertyModel.type)`${node}.${propertyModel.name}` as GetProp<T, K>;
  }
  throw new Error(`no such property '${key}' on '${node.constructor.name}'`);
};

type PropertyNames<T extends NodeLikeDefinition> = {
  [K in keyof T]: T[K] extends Property<any> ? (K extends string ? K : never) : never;
}[keyof T];

type GetProp<T extends NodeLikeDefinition, K extends PropertyNames<T>> = T[K] extends Property<
  infer TProperty
>
  ? TProperty["type"]
  : never;

/**
 *  Property access for an untyped node
 */
export const anyProp = <TType extends AllowedPropertyValue = Optional<AnyProperty>>(
  node:
    | NodeValue
    | NodeUnionValue
    | RelationshipValue
    | Optional<NodeValue | NodeUnionValue | RelationshipValue>,
  name: string,
  type?: TypeOf<TType>,
): TType => {
  return expression((type ?? Optional.of(AnyProperty)) as any)`${node}.${name}` as TType;
};
