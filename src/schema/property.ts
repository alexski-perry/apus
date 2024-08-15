import { Id } from "@utils/Id";
import { HasKey } from "@utils/has-key";
import { PropertyValue } from "@cypher/types/property";
import { optional, Optional, UnwrapOptional } from "@cypher/types/optional";
import { list, List } from "@cypher/types/list";
import { GetValueInputType, ValueOrInputType } from "@core/value";
import { ScalarValue } from "@cypher/types/scalar";
import { TypeOf } from "@core/type/type";
import { String } from "@cypher/types/scalar/string";
import { Int } from "@cypher/types/scalar/int";
import { ID } from "@cypher/types/scalar/id";
import { Boolean } from "@cypher/types/scalar/boolean";
import { Date } from "@cypher/types/scalar/date";
import { JSON } from "@cypher/types/scalar/json";
import { PropertyDefinition, PropertyTypeInfo } from "@schema/definition";
import { DateTime } from "@cypher/types/scalar/date-time";

// **************** //
// GENERIC PROPERTY //
// **************** //

export function property<TType extends PropertyValue>(
  type: TypeOf<TType>,
): PropertyDefinition<MakeProperty<TType, {}>>;

export function property<TType extends PropertyValue>(
  type: TypeOf<TType>,
  name: string,
): PropertyDefinition<MakeProperty<TType, {}>>;

export function property<TType extends PropertyValue, TConfig extends PropertyConfig<TType>>(
  type: TypeOf<TType>,
  name: string,
  config: TConfig,
): PropertyDefinition<MakeProperty<TType, TConfig>>;

export function property<
  TType extends PropertyValue,
  TConfig extends PropertyConfigWithName<TType>,
>(type: TypeOf<TType>, config: TConfig): PropertyDefinition<MakeProperty<TType, TConfig>>;

export function property(
  type: TypeOf<PropertyValue>,
  p1?: string | PropertyConfigWithName<any>,
  p2?: PropertyConfig<any>,
): PropertyDefinition<any> {
  return makeProperty(type, p1, p2);
}

// ********************* //
// GENERIC LIST PROPERTY //
// ********************* //

export function property_list<
  TType extends ScalarValue<any, any, any> | Optional<ScalarValue<any, any, any>>,
>(type: TypeOf<TType>): PropertyDefinition<MakeListProperty<List<TType>, {}>>;

export function property_list<
  TType extends ScalarValue<any, any, any> | Optional<ScalarValue<any, any, any>>,
>(type: TypeOf<TType>, name: string): PropertyDefinition<MakeListProperty<List<TType>, {}>>;

export function property_list<
  TType extends ScalarValue<any, any, any> | Optional<ScalarValue<any, any, any>>,
  TConfig extends PropertyConfig<List<TType>>,
>(
  type: TypeOf<TType>,
  name: string,
  config: TConfig,
): PropertyDefinition<MakeListProperty<List<TType>, TConfig>>;

export function property_list<
  TType extends ScalarValue<any, any, any> | Optional<ScalarValue<any, any, any>>,
  TConfig extends PropertyConfigWithName<List<TType>>,
>(
  type: TypeOf<TType>,
  config: TConfig,
): PropertyDefinition<MakeListProperty<List<TType>, TConfig>>;

export function property_list(
  type: TypeOf<ScalarValue<any, any, any> | Optional<ScalarValue<any, any, any>>>,
  p1?: string | PropertyConfigWithName<any>,
  p2?: PropertyConfig<any>,
): PropertyDefinition<any> {
  return makeListProperty(list(type), p1, p2);
}

// ****** //
// STRING //
// ****** //

export function string(): PropertyDefinition<MakeProperty<String, {}>>;
export function string(name: string): PropertyDefinition<MakeProperty<String, {}>>;

export function string<TConfig extends PropertyConfig<String>>(
  name: string,
  config: TConfig,
): PropertyDefinition<MakeProperty<String, TConfig>>;

export function string<TConfig extends PropertyConfigWithName<String>>(
  config: TConfig,
): PropertyDefinition<MakeProperty<String, TConfig>>;

export function string(
  p1?: string | PropertyConfigWithName<String>,
  p2?: PropertyConfig<String>,
): PropertyDefinition<any> {
  return makeProperty(String, p1, p2);
}

// *********** //
// STRING LIST //
// *********** //

export function string_list(): PropertyDefinition<MakeListProperty<List<String>, {}>>;
export function string_list(
  name: string,
): PropertyDefinition<MakeListProperty<List<String>, {}>>;

export function string_list<TConfig extends PropertyConfig<List<String>>>(
  name: string,
  config?: TConfig,
): PropertyDefinition<MakeListProperty<List<String>, TConfig>>;

export function string_list<TConfig extends PropertyConfigWithName<List<String>>>(
  config?: TConfig,
): PropertyDefinition<MakeListProperty<List<String>, TConfig>>;

export function string_list(
  p1?: string | PropertyConfigWithName<List<String>>,
  p2?: PropertyConfig<List<String>>,
): PropertyDefinition<any> {
  return makeListProperty(list(String), p1, p2);
}

// *************** //
// OPTIONAL STRING //
// *************** //

export function string_optional(): PropertyDefinition<MakeProperty<Optional<String>, {}>>;
export function string_optional(
  name: string,
): PropertyDefinition<MakeProperty<Optional<String>, {}>>;

export function string_optional<TConfig extends PropertyConfig<Optional<String>>>(
  name: string,
  config?: TConfig,
): PropertyDefinition<MakeProperty<Optional<String>, TConfig>>;

export function string_optional<TConfig extends PropertyConfigWithName<Optional<String>>>(
  config?: TConfig,
): PropertyDefinition<MakeProperty<Optional<String>, TConfig>>;

export function string_optional(
  p1?: string | PropertyConfigWithName<Optional<String>>,
  p2?: PropertyConfig<Optional<String>>,
): PropertyDefinition<any> {
  return makeProperty(optional(String), p1, p2);
}

// *** //
// INT //
// *** //

export function int(): PropertyDefinition<MakeProperty<Int, {}>>;
export function int(name: string): PropertyDefinition<MakeProperty<Int, {}>>;

export function int<TConfig extends PropertyConfig<Int>>(
  name: string,
  config?: TConfig,
): PropertyDefinition<MakeProperty<Int, TConfig>>;

export function int<TConfig extends PropertyConfigWithName<Int>>(
  config?: TConfig,
): PropertyDefinition<MakeProperty<Int, TConfig>>;

export function int(
  p1?: string | PropertyConfigWithName<Int>,
  p2?: PropertyConfig<Int>,
): PropertyDefinition<any> {
  return makeProperty(Int, p1, p2);
}

// ******** //
// INT LIST //
// ******** //

export function int_list(): PropertyDefinition<MakeListProperty<List<Int>, {}>>;
export function int_list(name: string): PropertyDefinition<MakeListProperty<List<Int>, {}>>;

export function int_list<TConfig extends PropertyConfigFlat<List<Int>>>(
  name: string,
  config?: TConfig,
): PropertyDefinition<MakeListProperty<List<Int>, TConfig>>;

export function int_list<TConfig extends PropertyConfigWithName<List<Int>>>(
  config?: TConfig,
): PropertyDefinition<MakeListProperty<List<Int>, TConfig>>;

export function int_list(
  p1?: string | PropertyConfigWithName<List<Int>>,
  p2?: PropertyConfig<List<Int>>,
): PropertyDefinition<any> {
  return makeListProperty(list(Int), p1, p2);
}

// ************ //
// OPTIONAL INT //
// ************ //

export function int_optional(): PropertyDefinition<MakeProperty<Optional<Int>, {}>>;
export function int_optional(
  name: string,
): PropertyDefinition<MakeProperty<Optional<Int>, {}>>;

export function int_optional<TConfig extends PropertyConfig<Optional<Int>>>(
  name: string,
  config?: TConfig,
): PropertyDefinition<MakeProperty<Optional<Int>, TConfig>>;

export function int_optional<TConfig extends PropertyConfigWithName<Optional<Int>>>(
  config?: TConfig,
): PropertyDefinition<MakeProperty<Optional<Int>, TConfig>>;

export function int_optional(
  p1?: string | PropertyConfigWithName<Optional<Int>>,
  p2?: PropertyConfig<Optional<Int>>,
): PropertyDefinition<any> {
  return makeProperty(optional(Int), p1, p2);
}

// ** //
// ID //
// ** //

export function id(): PropertyDefinition<MakeProperty<ID, {}>>;
export function id(name: string): PropertyDefinition<MakeProperty<ID, {}>>;

export function id<TConfig extends PropertyConfig<ID>>(
  name: string,
  config?: TConfig,
): PropertyDefinition<MakeProperty<ID, TConfig>>;

export function id<TConfig extends PropertyConfigWithName<ID>>(
  config?: TConfig,
): PropertyDefinition<MakeProperty<ID, TConfig>>;

export function id(
  p1?: string | PropertyConfigWithName<ID>,
  p2?: PropertyConfig<ID>,
): PropertyDefinition<any> {
  return makeProperty(ID, p1, p2);
}

// ******* //
// ID LIST //
// ******* //

export function id_list(): PropertyDefinition<MakeListProperty<List<ID>, {}>>;
export function id_list(name: string): PropertyDefinition<MakeListProperty<List<ID>, {}>>;

export function id_list<TConfig extends PropertyConfigFlat<List<ID>>>(
  name: string,
  config?: TConfig,
): PropertyDefinition<MakeListProperty<List<ID>, TConfig>>;

export function id_list<TConfig extends PropertyConfigWithName<List<ID>>>(
  config?: TConfig,
): PropertyDefinition<MakeListProperty<List<ID>, TConfig>>;

export function id_list(
  p1?: string | PropertyConfigWithName<List<ID>>,
  p2?: PropertyConfig<List<ID>>,
): PropertyDefinition<any> {
  return makeListProperty(list(ID), p1, p2);
}

// *********** //
// OPTIONAL ID //
// *********** //

export function id_optional(): PropertyDefinition<MakeProperty<Optional<ID>, {}>>;
export function id_optional(name: string): PropertyDefinition<MakeProperty<Optional<ID>, {}>>;

export function id_optional<TConfig extends PropertyConfig<Optional<ID>>>(
  name: string,
  config?: TConfig,
): PropertyDefinition<MakeProperty<Optional<ID>, TConfig>>;

export function id_optional<TConfig extends PropertyConfigWithName<Optional<ID>>>(
  config?: TConfig,
): PropertyDefinition<MakeProperty<Optional<ID>, TConfig>>;

export function id_optional(
  p1?: string | PropertyConfigWithName<Optional<ID>>,
  p2?: PropertyConfig<Optional<ID>>,
): PropertyDefinition<any> {
  return makeProperty(optional(ID), p1, p2);
}

// ******* //
// BOOLEAN //
// ******* //

export function boolean(): PropertyDefinition<MakeProperty<Boolean, {}>>;
export function boolean(name: string): PropertyDefinition<MakeProperty<Boolean, {}>>;

export function boolean<TConfig extends PropertyConfig<Boolean>>(
  name: string,
  config?: TConfig,
): PropertyDefinition<MakeProperty<Boolean, TConfig>>;

export function boolean<TConfig extends PropertyConfigWithName<Boolean>>(
  config?: TConfig,
): PropertyDefinition<MakeProperty<Boolean, TConfig>>;

export function boolean(
  p1?: string | PropertyConfigWithName<Boolean>,
  p2?: PropertyConfig<Boolean>,
): PropertyDefinition<any> {
  return makeProperty(Boolean, p1, p2);
}

// ************ //
// BOOLEAN LIST //
// ************ //

export function boolean_list(): PropertyDefinition<MakeListProperty<List<Boolean>, {}>>;
export function boolean_list(
  name: string,
): PropertyDefinition<MakeListProperty<List<Boolean>, {}>>;

export function boolean_list<TConfig extends PropertyConfigFlat<List<Boolean>>>(
  name: string,
  config?: TConfig,
): PropertyDefinition<MakeListProperty<List<Boolean>, TConfig>>;

export function boolean_list<TConfig extends PropertyConfigWithName<List<Boolean>>>(
  config?: TConfig,
): PropertyDefinition<MakeListProperty<List<Boolean>, TConfig>>;

export function boolean_list(
  p1?: string | PropertyConfigWithName<List<Boolean>>,
  p2?: PropertyConfig<List<Boolean>>,
): PropertyDefinition<any> {
  return makeListProperty(list(Boolean), p1, p2);
}

// **************** //
// OPTIONAL BOOLEAN //
// **************** //

export function boolean_optional(): PropertyDefinition<MakeProperty<Optional<Boolean>, {}>>;
export function boolean_optional(
  name: string,
): PropertyDefinition<MakeProperty<Optional<Boolean>, {}>>;

export function boolean_optional<TConfig extends PropertyConfig<Optional<Boolean>>>(
  name: string,
  config?: TConfig,
): PropertyDefinition<MakeProperty<Optional<Boolean>, TConfig>>;

export function boolean_optional<TConfig extends PropertyConfigWithName<Optional<Boolean>>>(
  config?: TConfig,
): PropertyDefinition<MakeProperty<Optional<Boolean>, TConfig>>;

export function boolean_optional(
  p1?: string | PropertyConfigWithName<Optional<Boolean>>,
  p2?: PropertyConfig<Optional<Boolean>>,
): PropertyDefinition<any> {
  return makeProperty(optional(Boolean), p1, p2);
}

// **** //
// DATE //
// **** //

export function date(): PropertyDefinition<MakeProperty<Date, {}>>;
export function date(name: string): PropertyDefinition<MakeProperty<Date, {}>>;

export function date<TConfig extends PropertyConfig<Date>>(
  name: string,
  config?: TConfig,
): PropertyDefinition<MakeProperty<Date, TConfig>>;

export function date<TConfig extends PropertyConfigWithName<Date>>(
  config?: TConfig,
): PropertyDefinition<MakeProperty<Date, TConfig>>;

export function date(
  p1?: string | PropertyConfigWithName<Date>,
  p2?: PropertyConfig<Date>,
): PropertyDefinition<any> {
  return makeProperty(Date, p1, p2);
}

// ********* //
// DATE LIST //
// ********* //

export function date_list(): PropertyDefinition<MakeListProperty<List<Date>, {}>>;
export function date_list(name: string): PropertyDefinition<MakeListProperty<List<Date>, {}>>;

export function date_list<TConfig extends PropertyConfigFlat<List<Date>>>(
  name: string,
  config?: TConfig,
): PropertyDefinition<MakeListProperty<List<Date>, TConfig>>;

export function date_list<TConfig extends PropertyConfigWithName<List<Date>>>(
  config?: TConfig,
): PropertyDefinition<MakeListProperty<List<Date>, TConfig>>;

export function date_list(
  p1?: string | PropertyConfigWithName<List<Date>>,
  p2?: PropertyConfig<List<Date>>,
): PropertyDefinition<any> {
  return makeListProperty(list(Date), p1, p2);
}

// ************* //
// OPTIONAL DATE //
// ************* //

export function date_optional(): PropertyDefinition<MakeProperty<Optional<Date>, {}>>;
export function date_optional(
  name: string,
): PropertyDefinition<MakeProperty<Optional<Date>, {}>>;

export function date_optional<TConfig extends PropertyConfig<Optional<Date>>>(
  name: string,
  config?: TConfig,
): PropertyDefinition<MakeProperty<Optional<Date>, TConfig>>;

export function date_optional<TConfig extends PropertyConfigWithName<Optional<Date>>>(
  config?: TConfig,
): PropertyDefinition<MakeProperty<Optional<Date>, TConfig>>;

export function date_optional(
  p1?: string | PropertyConfigWithName<Optional<Date>>,
  p2?: PropertyConfig<Optional<Date>>,
): PropertyDefinition<any> {
  return makeProperty(optional(Date), p1, p2);
}

// **** //
// DATE //
// **** //

export function dateTime(): PropertyDefinition<MakeProperty<DateTime, {}>>;
export function dateTime(name: string): PropertyDefinition<MakeProperty<DateTime, {}>>;

export function dateTime<TConfig extends PropertyConfig<DateTime>>(
  name: string,
  config?: TConfig,
): PropertyDefinition<MakeProperty<DateTime, TConfig>>;

export function dateTime<TConfig extends PropertyConfigWithName<DateTime>>(
  config?: TConfig,
): PropertyDefinition<MakeProperty<DateTime, TConfig>>;

export function dateTime(
  p1?: string | PropertyConfigWithName<DateTime>,
  p2?: PropertyConfig<DateTime>,
): PropertyDefinition<any> {
  return makeProperty(DateTime, p1, p2);
}

// ********* //
// DATE LIST //
// ********* //

export function dateTime_list(): PropertyDefinition<MakeListProperty<List<DateTime>, {}>>;
export function dateTime_list(
  name: string,
): PropertyDefinition<MakeListProperty<List<DateTime>, {}>>;

export function dateTime_list<TConfig extends PropertyConfigFlat<List<DateTime>>>(
  name: string,
  config?: TConfig,
): PropertyDefinition<MakeListProperty<List<DateTime>, TConfig>>;

export function dateTime_list<TConfig extends PropertyConfigWithName<List<DateTime>>>(
  config?: TConfig,
): PropertyDefinition<MakeListProperty<List<DateTime>, TConfig>>;

export function dateTime_list(
  p1?: string | PropertyConfigWithName<List<DateTime>>,
  p2?: PropertyConfig<List<DateTime>>,
): PropertyDefinition<any> {
  return makeListProperty(list(DateTime), p1, p2);
}

// ************* //
// OPTIONAL DATE //
// ************* //

export function dateTime_optional(): PropertyDefinition<MakeProperty<Optional<DateTime>, {}>>;
export function dateTime_optional(
  name: string,
): PropertyDefinition<MakeProperty<Optional<DateTime>, {}>>;

export function dateTime_optional<TConfig extends PropertyConfig<Optional<DateTime>>>(
  name: string,
  config?: TConfig,
): PropertyDefinition<MakeProperty<Optional<DateTime>, TConfig>>;

export function dateTime_optional<TConfig extends PropertyConfigWithName<Optional<DateTime>>>(
  config?: TConfig,
): PropertyDefinition<MakeProperty<Optional<DateTime>, TConfig>>;

export function dateTime_optional(
  p1?: string | PropertyConfigWithName<Optional<DateTime>>,
  p2?: PropertyConfig<Optional<DateTime>>,
): PropertyDefinition<any> {
  return makeProperty(optional(DateTime), p1, p2);
}

// todo remaining temporal types

// **** //
// JSON //
// **** //

export function json(): PropertyDefinition<MakeProperty<JSON, {}>>;
export function json(name: string): PropertyDefinition<MakeProperty<JSON, {}>>;

export function json<TConfig extends PropertyConfig<JSON>>(
  name: string,
  config?: TConfig,
): PropertyDefinition<MakeProperty<JSON, TConfig>>;

export function json<TConfig extends PropertyConfigWithName<JSON>>(
  config?: TConfig,
): PropertyDefinition<MakeProperty<JSON, TConfig>>;

export function json(
  p1?: string | PropertyConfigWithName<JSON>,
  p2?: PropertyConfig<JSON>,
): PropertyDefinition<any> {
  return makeProperty(JSON, p1, p2);
}

// ********* //
// JSON LIST //
// ********* //

export function json_list(): PropertyDefinition<MakeListProperty<List<JSON>, {}>>;
export function json_list(name: string): PropertyDefinition<MakeListProperty<List<JSON>, {}>>;

export function json_list<TConfig extends PropertyConfigFlat<List<JSON>>>(
  name: string,
  config?: TConfig,
): PropertyDefinition<MakeListProperty<List<JSON>, TConfig>>;

export function json_list<TConfig extends PropertyConfigWithName<List<JSON>>>(
  config?: TConfig,
): PropertyDefinition<MakeListProperty<List<JSON>, TConfig>>;

export function json_list(
  p1?: string | PropertyConfigWithName<List<JSON>>,
  p2?: PropertyConfig<List<JSON>>,
): PropertyDefinition<any> {
  return makeListProperty(list(JSON), p1, p2);
}

// ************* //
// OPTIONAL JSON //
// ************* //

export function json_optional(): PropertyDefinition<MakeProperty<Optional<JSON>, {}>>;
export function json_optional(
  name: string,
): PropertyDefinition<MakeProperty<Optional<JSON>, {}>>;

export function json_optional<TConfig extends PropertyConfig<Optional<JSON>>>(
  name: string,
  config?: TConfig,
): PropertyDefinition<MakeProperty<Optional<JSON>, TConfig>>;

export function json_optional<TConfig extends PropertyConfigWithName<Optional<JSON>>>(
  config?: TConfig,
): PropertyDefinition<MakeProperty<Optional<JSON>, TConfig>>;

export function json_optional(
  p1?: string | PropertyConfigWithName<Optional<JSON>>,
  p2?: PropertyConfig<Optional<JSON>>,
): PropertyDefinition<any> {
  return makeProperty(optional(JSON), p1, p2);
}

/*
  INTERNAL HELPERS
 */

type PropertyConfigWithName<TType extends PropertyValue> = PropertyConfig<TType> & {
  name?: string;
};

type PropertyConfig<TType extends PropertyValue> = {
  validate?: (val: UnwrapOptional<TType>) => Boolean;
} & (
  | {
      generate?: TType | GetValueInputType<TType>;
      default?: never;
    }
  | {
      default?: TType | GetValueInputType<TType>;
      generate?: never;
    }
) &
  (
    | {
        onUpdateGenerate?: TType | GetValueInputType<TType>;
        updateDefault?: never;
        readonly?: never;
      }
    | {
        updateDefault?: TType | GetValueInputType<TType>;
        readonly?: never;
        onUpdateGenerate?: never;
      }
    | {
        readonly?: boolean;
        updateDefault?: never;
        onUpdateGenerate?: never;
      }
  );

interface PropertyConfigFlat<TType extends PropertyValue> {
  name?: string;
  validate?: (val: UnwrapOptional<TType>) => Boolean;
  generate?: ValueOrInputType<TType>;
  default?: ValueOrInputType<TType>;
  onUpdateGenerate?: ValueOrInputType<TType>;
  updateDefault?: ValueOrInputType<TType>;
  readonly?: boolean;
}

const makeProperty = (
  type: TypeOf<PropertyValue>,
  p1?: string | PropertyConfigFlat<any>,
  p2?: PropertyConfigFlat<any>,
) => {
  const overrideName =
    typeof p1 === "string"
      ? p1
      : typeof p2 === "object" && !!p2 && typeof p2.name === "string"
        ? p2.name
        : undefined;

  const config = p1 && typeof p1 === "object" ? p1 : p2;

  return {
    kind: "Property",
    __typeInfo: null as any,
    overrideName,
    type,
    validate: config?.validate,
    creationStrategy: config?.generate
      ? { kind: "autogen", autogenValue: config.generate, canOverride: false }
      : config?.default
        ? { kind: "autogen", autogenValue: config.default, canOverride: true }
        : { kind: "input" },
    updateStrategy: config?.onUpdateGenerate
      ? { kind: "autogen", autogenValue: config.onUpdateGenerate, canOverride: false }
      : config?.updateDefault
        ? { kind: "autogen", autogenValue: config.updateDefault, canOverride: true }
        : config?.readonly
          ? { kind: "not-allowed" }
          : { kind: "input" },
  } satisfies PropertyDefinition<PropertyTypeInfo>;
};

// this differs in making the property have an empty list as default
const makeListProperty = (
  type: TypeOf<List<ScalarValue<any, any, any> | Optional<ScalarValue<any, any, any>>>>,
  p1?: string | PropertyConfigFlat<any>,
  p2?: PropertyConfigFlat<any>,
) => {
  const overrideName =
    typeof p1 === "string"
      ? p1
      : typeof p2 === "object" && !!p2 && typeof p2.name === "string"
        ? p2.name
        : undefined;

  const config = p1 && typeof p1 === "object" ? p1 : p2;

  return {
    kind: "Property",
    __typeInfo: null as any,
    overrideName,
    type,
    validate: config?.validate,
    creationStrategy: config?.generate
      ? { kind: "autogen", autogenValue: config.generate, canOverride: false }
      : { kind: "autogen", autogenValue: config?.default ?? [], canOverride: true },
    updateStrategy: config?.onUpdateGenerate
      ? { kind: "autogen", autogenValue: config.generate, canOverride: false }
      : config?.updateDefault
        ? { kind: "autogen", autogenValue: config.default, canOverride: true }
        : config?.readonly
          ? { kind: "not-allowed" }
          : { kind: "input" },
  } satisfies PropertyDefinition<PropertyTypeInfo>;
};

type MakeProperty<
  TType extends PropertyValue,
  TConfig extends PropertyConfigFlat<TType>,
> = Id<{
  type: TType;
  creationStrategy: GetCreationStrategy<TConfig>;
  updateStrategy: GetUpdateStrategy<TConfig>;
}>;

type MakeListProperty<
  TType extends List<ScalarValue<any, any, any> | Optional<ScalarValue<any, any, any>>>,
  TConfig extends PropertyConfigFlat<TType>,
> = Id<{
  type: TType;
  creationStrategy: GetListCreationStrategy<TConfig>;
  updateStrategy: GetUpdateStrategy<TConfig>;
}>;

type GetCreationStrategy<TConfig extends PropertyConfigFlat<any>> = HasKey<
  TConfig,
  "generate"
> extends true
  ? "autogen"
  : HasKey<TConfig, "default"> extends true
    ? "with-default"
    : "input";

type GetListCreationStrategy<TConfig extends PropertyConfigFlat<any>> = HasKey<
  TConfig,
  "generate"
> extends true
  ? "autogen"
  : "with-default";

type GetUpdateStrategy<TConfig extends PropertyConfigFlat<any>> = HasKey<
  TConfig,
  "onUpdateGenerate"
> extends true
  ? "autogen"
  : HasKey<TConfig, "updateDefault"> extends true
    ? "with-default"
    : HasKey<TConfig, "readonly"> extends true
      ? "not-allowed"
      : "input";
