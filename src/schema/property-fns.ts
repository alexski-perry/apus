import { Property } from "./index";
import { ConstructorOf } from "@utils/ConstructorOf";
import { QueryDataInput } from "@core/utils";
import {
  AllowedPropertyValue,
  Boolean,
  Date,
  ID,
  Int,
  JSON,
  list,
  List,
  optional,
  Optional,
  PropertyValue,
  String,
  UnwrapOptional,
} from "@cypher/types";
import { Id } from "@utils/Id";
import { HasKey } from "@utils/has-key";

type PropertyConfigWithName<TType extends AllowedPropertyValue> = PropertyConfig<TType> & {
  name?: string;
};

type PropertyConfig<TType extends AllowedPropertyValue> = {
  validate?: (val: UnwrapOptional<TType>) => Boolean;
} & (
  | {
      generate?: TType | QueryDataInput<TType>;
      default?: never;
    }
  | {
      default?: TType | QueryDataInput<TType>;
      generate?: never;
    }
) &
  (
    | {
        onUpdateGenerate?: TType | QueryDataInput<TType>;
        updateDefault?: never;
        readonly?: never;
      }
    | {
        updateDefault?: TType | QueryDataInput<TType>;
        readonly?: never;
        onUpdateGenerate?: never;
      }
    | {
        readonly?: boolean;
        updateDefault?: never;
        onUpdateGenerate?: never;
      }
  );

interface PropertyConfigFlat<TType extends AllowedPropertyValue> {
  name?: string;
  validate?: (val: UnwrapOptional<TType>) => Boolean;
  generate?: TType | QueryDataInput<TType>;
  default?: TType | QueryDataInput<TType>;
  onUpdateGenerate?: TType | QueryDataInput<TType>;
  updateDefault?: TType | QueryDataInput<TType>;
  readonly?: boolean;
}

const makeProperty = (
  type: ConstructorOf<AllowedPropertyValue>,
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

  return new Property({
    overrideName,
    type,
    validate: config?.validate,
    creationStrategy: config?.generate
      ? { kind: "autogen", autogenValue: config.generate, canOverride: false }
      : config?.default
      ? { kind: "autogen", autogenValue: config.default, canOverride: true }
      : { kind: "input" },
    updateStrategy: config?.onUpdateGenerate
      ? { kind: "autogen", autogenValue: config.generate, canOverride: false }
      : config?.updateDefault
      ? { kind: "autogen", autogenValue: config.default, canOverride: true }
      : config?.readonly
      ? { kind: "not-allowed" }
      : { kind: "input" },
  });
};

// this differs in making the property have an empty list as default
const makeListProperty = (
  type: ConstructorOf<List<PropertyValue | Optional<PropertyValue>>>,
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

  return new Property({
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
  });
};

type MakeProperty<
  TType extends AllowedPropertyValue,
  TConfig extends PropertyConfigFlat<TType>,
> = Id<{
  type: TType;
  creationStrategy: GetCreationStrategy<TConfig>;
  updateStrategy: GetUpdateStrategy<TConfig>;
}>;

type MakeListProperty<
  TType extends List<PropertyValue | Optional<PropertyValue>>,
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

/*
  GENERIC PROPERTY
 */

export function property<TType extends AllowedPropertyValue>(
  type: ConstructorOf<TType>,
): Property<MakeProperty<TType, {}>>;

export function property<TType extends AllowedPropertyValue>(
  type: ConstructorOf<TType>,
  name: string,
): Property<MakeProperty<TType, {}>>;

export function property<
  TType extends AllowedPropertyValue,
  TConfig extends PropertyConfig<TType>,
>(
  type: ConstructorOf<TType>,
  name: string,
  config: TConfig,
): Property<MakeProperty<TType, TConfig>>;

export function property<
  TType extends AllowedPropertyValue,
  TConfig extends PropertyConfigWithName<TType>,
>(type: ConstructorOf<TType>, config: TConfig): Property<MakeProperty<TType, TConfig>>;

export function property(
  type: ConstructorOf<AllowedPropertyValue>,
  p1?: string | PropertyConfigWithName<any>,
  p2?: PropertyConfig<any>,
): Property<any> {
  return makeProperty(type, p1, p2);
}

/*
  GENERIC LIST PROPERTY

 */

export function property_list<TType extends PropertyValue | Optional<PropertyValue>>(
  type: ConstructorOf<TType>,
): Property<MakeListProperty<List<TType>, {}>>;

export function property_list<TType extends PropertyValue | Optional<PropertyValue>>(
  type: ConstructorOf<TType>,
  name: string,
): Property<MakeListProperty<List<TType>, {}>>;

export function property_list<
  TType extends PropertyValue | Optional<PropertyValue>,
  TConfig extends PropertyConfig<List<TType>>,
>(
  type: ConstructorOf<TType>,
  name: string,
  config: TConfig,
): Property<MakeListProperty<List<TType>, TConfig>>;

export function property_list<
  TType extends PropertyValue | Optional<PropertyValue>,
  TConfig extends PropertyConfigWithName<List<TType>>,
>(
  type: ConstructorOf<TType>,
  config: TConfig,
): Property<MakeListProperty<List<TType>, TConfig>>;

export function property_list(
  type: ConstructorOf<PropertyValue | Optional<PropertyValue>>,
  p1?: string | PropertyConfigWithName<any>,
  p2?: PropertyConfig<any>,
): Property<any> {
  return makeListProperty(list(type), p1, p2);
}

/*
  STRING
 */

export function string(): Property<MakeProperty<String, {}>>;
export function string(name: string): Property<MakeProperty<String, {}>>;

export function string<TConfig extends PropertyConfig<String>>(
  name: string,
  config: TConfig,
): Property<MakeProperty<String, TConfig>>;

export function string<TConfig extends PropertyConfigWithName<String>>(
  config: TConfig,
): Property<MakeProperty<String, TConfig>>;

export function string(
  p1?: string | PropertyConfigWithName<String>,
  p2?: PropertyConfig<String>,
): Property<any> {
  return makeProperty(String, p1, p2);
}

/*
  STRING LIST
 */

export function string_list(): Property<MakeListProperty<List<String>, {}>>;
export function string_list(name: string): Property<MakeListProperty<List<String>, {}>>;

export function string_list<TConfig extends PropertyConfig<List<String>>>(
  name: string,
  config?: TConfig,
): Property<MakeListProperty<List<String>, TConfig>>;

export function string_list<TConfig extends PropertyConfigWithName<List<String>>>(
  config?: TConfig,
): Property<MakeListProperty<List<String>, TConfig>>;

export function string_list(
  p1?: string | PropertyConfigWithName<List<String>>,
  p2?: PropertyConfig<List<String>>,
): Property<any> {
  return makeListProperty(list(String), p1, p2);
}

/*
  OPTIONAL STRING
 */

export function string_optional(): Property<MakeProperty<Optional<String>, {}>>;
export function string_optional(name: string): Property<MakeProperty<Optional<String>, {}>>;

export function string_optional<TConfig extends PropertyConfig<Optional<String>>>(
  name: string,
  config?: TConfig,
): Property<MakeProperty<Optional<String>, TConfig>>;

export function string_optional<TConfig extends PropertyConfigWithName<Optional<String>>>(
  config?: TConfig,
): Property<MakeProperty<Optional<String>, TConfig>>;

export function string_optional(
  p1?: string | PropertyConfigWithName<Optional<String>>,
  p2?: PropertyConfig<Optional<String>>,
): Property<any> {
  return makeProperty(optional(String), p1, p2);
}

/*
  INT
 */

export function int(): Property<MakeProperty<Int, {}>>;
export function int(name: string): Property<MakeProperty<Int, {}>>;

export function int<TConfig extends PropertyConfig<Int>>(
  name: string,
  config?: TConfig,
): Property<MakeProperty<Int, TConfig>>;

export function int<TConfig extends PropertyConfigWithName<Int>>(
  config?: TConfig,
): Property<MakeProperty<Int, TConfig>>;

export function int(
  p1?: string | PropertyConfigWithName<Int>,
  p2?: PropertyConfig<Int>,
): Property<any> {
  return makeProperty(Int, p1, p2);
}

/*
  INT LIST
 */

export function int_list(): Property<MakeListProperty<List<Int>, {}>>;
export function int_list(name: string): Property<MakeListProperty<List<Int>, {}>>;

export function int_list<TConfig extends PropertyConfigFlat<List<Int>>>(
  name: string,
  config?: TConfig,
): Property<MakeListProperty<List<Int>, TConfig>>;

export function int_list<TConfig extends PropertyConfigWithName<List<Int>>>(
  config?: TConfig,
): Property<MakeListProperty<List<Int>, TConfig>>;

export function int_list(
  p1?: string | PropertyConfigWithName<List<Int>>,
  p2?: PropertyConfig<List<Int>>,
): Property<any> {
  return makeListProperty(list(Int), p1, p2);
}

/*
  OPTIONAL INT
 */

export function int_optional(): Property<MakeProperty<Optional<Int>, {}>>;
export function int_optional(name: string): Property<MakeProperty<Optional<Int>, {}>>;

export function int_optional<TConfig extends PropertyConfig<Optional<Int>>>(
  name: string,
  config?: TConfig,
): Property<MakeProperty<Optional<Int>, TConfig>>;

export function int_optional<TConfig extends PropertyConfigWithName<Optional<Int>>>(
  config?: TConfig,
): Property<MakeProperty<Optional<Int>, TConfig>>;

export function int_optional(
  p1?: string | PropertyConfigWithName<Optional<Int>>,
  p2?: PropertyConfig<Optional<Int>>,
): Property<any> {
  return makeProperty(optional(Int), p1, p2);
}

/*
  ID
 */

export function id(): Property<MakeProperty<ID, {}>>;
export function id(name: string): Property<MakeProperty<ID, {}>>;

export function id<TConfig extends PropertyConfig<ID>>(
  name: string,
  config?: TConfig,
): Property<MakeProperty<ID, TConfig>>;

export function id<TConfig extends PropertyConfigWithName<ID>>(
  config?: TConfig,
): Property<MakeProperty<ID, TConfig>>;

export function id(
  p1?: string | PropertyConfigWithName<ID>,
  p2?: PropertyConfig<ID>,
): Property<any> {
  return makeProperty(ID, p1, p2);
}

/*
  ID LIST
 */

export function id_list(): Property<MakeListProperty<List<ID>, {}>>;
export function id_list(name: string): Property<MakeListProperty<List<ID>, {}>>;

export function id_list<TConfig extends PropertyConfigFlat<List<ID>>>(
  name: string,
  config?: TConfig,
): Property<MakeListProperty<List<ID>, TConfig>>;

export function id_list<TConfig extends PropertyConfigWithName<List<ID>>>(
  config?: TConfig,
): Property<MakeListProperty<List<ID>, TConfig>>;

export function id_list(
  p1?: string | PropertyConfigWithName<List<ID>>,
  p2?: PropertyConfig<List<ID>>,
): Property<any> {
  return makeListProperty(list(ID), p1, p2);
}

/*
  OPTIONAL ID
 */

export function id_optional(): Property<MakeProperty<Optional<ID>, {}>>;
export function id_optional(name: string): Property<MakeProperty<Optional<ID>, {}>>;

export function id_optional<TConfig extends PropertyConfig<Optional<ID>>>(
  name: string,
  config?: TConfig,
): Property<MakeProperty<Optional<ID>, TConfig>>;

export function id_optional<TConfig extends PropertyConfigWithName<Optional<ID>>>(
  config?: TConfig,
): Property<MakeProperty<Optional<ID>, TConfig>>;

export function id_optional(
  p1?: string | PropertyConfigWithName<Optional<ID>>,
  p2?: PropertyConfig<Optional<ID>>,
): Property<any> {
  return makeProperty(optional(ID), p1, p2);
}

/*
  BOOLEAN
 */

export function boolean(): Property<MakeProperty<Boolean, {}>>;
export function boolean(name: string): Property<MakeProperty<Boolean, {}>>;

export function boolean<TConfig extends PropertyConfig<Boolean>>(
  name: string,
  config?: TConfig,
): Property<MakeProperty<Boolean, TConfig>>;

export function boolean<TConfig extends PropertyConfigWithName<Boolean>>(
  config?: TConfig,
): Property<MakeProperty<Boolean, TConfig>>;

export function boolean(
  p1?: string | PropertyConfigWithName<Boolean>,
  p2?: PropertyConfig<Boolean>,
): Property<any> {
  return makeProperty(Boolean, p1, p2);
}

/*
  BOOLEAN LIST
 */

export function boolean_list(): Property<MakeListProperty<List<Boolean>, {}>>;
export function boolean_list(name: string): Property<MakeListProperty<List<Boolean>, {}>>;

export function boolean_list<TConfig extends PropertyConfigFlat<List<Boolean>>>(
  name: string,
  config?: TConfig,
): Property<MakeListProperty<List<Boolean>, TConfig>>;

export function boolean_list<TConfig extends PropertyConfigWithName<List<Boolean>>>(
  config?: TConfig,
): Property<MakeListProperty<List<Boolean>, TConfig>>;

export function boolean_list(
  p1?: string | PropertyConfigWithName<List<Boolean>>,
  p2?: PropertyConfig<List<Boolean>>,
): Property<any> {
  return makeListProperty(list(Boolean), p1, p2);
}

/*
  OPTIONAL BOOLEAN
 */

export function boolean_optional(): Property<MakeProperty<Optional<Boolean>, {}>>;
export function boolean_optional(name: string): Property<MakeProperty<Optional<Boolean>, {}>>;

export function boolean_optional<TConfig extends PropertyConfig<Optional<Boolean>>>(
  name: string,
  config?: TConfig,
): Property<MakeProperty<Optional<Boolean>, TConfig>>;

export function boolean_optional<TConfig extends PropertyConfigWithName<Optional<Boolean>>>(
  config?: TConfig,
): Property<MakeProperty<Optional<Boolean>, TConfig>>;

export function boolean_optional(
  p1?: string | PropertyConfigWithName<Optional<Boolean>>,
  p2?: PropertyConfig<Optional<Boolean>>,
): Property<any> {
  return makeProperty(optional(Boolean), p1, p2);
}

/*
  DATE
 */

export function date(): Property<MakeProperty<Date, {}>>;
export function date(name: string): Property<MakeProperty<Date, {}>>;

export function date<TConfig extends PropertyConfig<Date>>(
  name: string,
  config?: TConfig,
): Property<MakeProperty<Date, TConfig>>;

export function date<TConfig extends PropertyConfigWithName<Date>>(
  config?: TConfig,
): Property<MakeProperty<Date, TConfig>>;

export function date(
  p1?: string | PropertyConfigWithName<Date>,
  p2?: PropertyConfig<Date>,
): Property<any> {
  return makeProperty(Date, p1, p2);
}

/*
  DATE LIST
 */

export function date_list(): Property<MakeListProperty<List<Date>, {}>>;
export function date_list(name: string): Property<MakeListProperty<List<Date>, {}>>;

export function date_list<TConfig extends PropertyConfigFlat<List<Date>>>(
  name: string,
  config?: TConfig,
): Property<MakeListProperty<List<Date>, TConfig>>;

export function date_list<TConfig extends PropertyConfigWithName<List<Date>>>(
  config?: TConfig,
): Property<MakeListProperty<List<Date>, TConfig>>;

export function date_list(
  p1?: string | PropertyConfigWithName<List<Date>>,
  p2?: PropertyConfig<List<Date>>,
): Property<any> {
  return makeListProperty(list(Date), p1, p2);
}

/*
  OPTIONAL DATE
 */

export function date_optional(): Property<MakeProperty<Optional<Date>, {}>>;
export function date_optional(name: string): Property<MakeProperty<Optional<Date>, {}>>;

export function date_optional<TConfig extends PropertyConfig<Optional<Date>>>(
  name: string,
  config?: TConfig,
): Property<MakeProperty<Optional<Date>, TConfig>>;

export function date_optional<TConfig extends PropertyConfigWithName<Optional<Date>>>(
  config?: TConfig,
): Property<MakeProperty<Optional<Date>, TConfig>>;

export function date_optional(
  p1?: string | PropertyConfigWithName<Optional<Date>>,
  p2?: PropertyConfig<Optional<Date>>,
): Property<any> {
  return makeProperty(optional(Date), p1, p2);
}

/*
  JSON
 */

export function json(): Property<MakeProperty<JSON, {}>>;
export function json(name: string): Property<MakeProperty<JSON, {}>>;

export function json<TConfig extends PropertyConfig<JSON>>(
  name: string,
  config?: TConfig,
): Property<MakeProperty<JSON, TConfig>>;

export function json<TConfig extends PropertyConfigWithName<JSON>>(
  config?: TConfig,
): Property<MakeProperty<JSON, TConfig>>;

export function json(
  p1?: string | PropertyConfigWithName<JSON>,
  p2?: PropertyConfig<JSON>,
): Property<any> {
  return makeProperty(JSON, p1, p2);
}

/*
  JSON LIST
 */

export function json_list(): Property<MakeListProperty<List<JSON>, {}>>;
export function json_list(name: string): Property<MakeListProperty<List<JSON>, {}>>;

export function json_list<TConfig extends PropertyConfigFlat<List<JSON>>>(
  name: string,
  config?: TConfig,
): Property<MakeListProperty<List<JSON>, TConfig>>;

export function json_list<TConfig extends PropertyConfigWithName<List<JSON>>>(
  config?: TConfig,
): Property<MakeListProperty<List<JSON>, TConfig>>;

export function json_list(
  p1?: string | PropertyConfigWithName<List<JSON>>,
  p2?: PropertyConfig<List<JSON>>,
): Property<any> {
  return makeListProperty(list(JSON), p1, p2);
}

/*
  OPTIONAL JSON
 */

export function json_optional(): Property<MakeProperty<Optional<JSON>, {}>>;
export function json_optional(name: string): Property<MakeProperty<Optional<JSON>, {}>>;

export function json_optional<TConfig extends PropertyConfig<Optional<JSON>>>(
  name: string,
  config?: TConfig,
): Property<MakeProperty<Optional<JSON>, TConfig>>;

export function json_optional<TConfig extends PropertyConfigWithName<Optional<JSON>>>(
  config?: TConfig,
): Property<MakeProperty<Optional<JSON>, TConfig>>;

export function json_optional(
  p1?: string | PropertyConfigWithName<Optional<JSON>>,
  p2?: PropertyConfig<Optional<JSON>>,
): Property<any> {
  return makeProperty(optional(JSON), p1, p2);
}
