import {
  AbstractNodeConfig,
  AbstractRelationshipConfig,
  NodeConfig,
  NodeTemplateConfig,
  NodeUnionConfig,
  RelationshipConfig,
  RelationshipTemplateConfig,
  RelationshipUnionConfig,
} from "@schema/entity-config";
import { ConstructorOf } from "@utils/ConstructorOf";
import { PropertyValue } from "@cypher/types/property";
import { TypeOf } from "@core/type/type";
import { Value } from "@core/value";
import { Boolean } from "@cypher/types/scalar/boolean";

export interface NodeDefinition {
  $: NodeConfig<string, NodeSubtypes | undefined>;
}

export interface AbstractNodeDefinition {
  $: AbstractNodeConfig<string, NodeSubtypes | undefined>;
}

export interface NodeUnionDefinition {
  $: NodeUnionConfig<NodeSubtypes>;
}

export interface NodeTemplateDefinition {
  $: NodeTemplateConfig;
}

export interface RelationshipDefinition {
  $: RelationshipConfig<string>;
}

export interface AbstractRelationshipDefinition {
  $: AbstractRelationshipConfig<string, RelationshipSubtypes | undefined>;
}

export interface RelationshipUnionDefinition {
  $: RelationshipUnionConfig<RelationshipSubtypes>;
}

export interface RelationshipTemplateDefinition {
  $: RelationshipTemplateConfig;
}

export type NodeDefinitionClass = ConstructorOf<NodeDefinition>;
export type AbstractNodeDefinitionClass = ConstructorOf<AbstractNodeDefinition>;
export type NodeUnionDefinitionClass = ConstructorOf<NodeUnionDefinition>;
export type NodeTemplateDefinitionClass = ConstructorOf<NodeTemplateDefinition>;
export type RelationshipDefinitionClass = ConstructorOf<RelationshipDefinition>;
export type AbstractRelationshipDefinitionClass =
  ConstructorOf<AbstractRelationshipDefinition>;
export type RelationshipUnionDefinitionClass = ConstructorOf<RelationshipUnionDefinition>;
export type RelationshipTemplateDefinitionClass =
  ConstructorOf<RelationshipTemplateDefinition>;

export type NodeSubtypes = Array<NodeDefinitionClass | AbstractNodeDefinitionClass>;
export type RelationshipSubtypes = Array<
  RelationshipDefinitionClass | AbstractRelationshipDefinitionClass
>;

export interface PropertyDefinition<TTypeInfo extends PropertyTypeInfo> {
  __typeInfo: TTypeInfo;
  kind: "Property";
  type: TypeOf<PropertyValue>;
  overrideName?: string;
  creationStrategy:
    | { kind: "input" }
    | { kind: "autogen"; autogenValue: any; canOverride: boolean };
  updateStrategy:
    | { kind: "input" }
    | { kind: "not-allowed" }
    | { kind: "autogen"; autogenValue: any; canOverride: boolean };
  validate?: (val: Value) => Boolean;
}

export function isPropertyDefinition(
  value: unknown,
): value is PropertyDefinition<PropertyTypeInfo> {
  return !!value && typeof value === "object" && "kind" in value && value.kind === "Property";
}

export interface PropertyTypeInfo {
  type: PropertyValue;
  creationStrategy: "input" | "autogen" | "with-default";
  updateStrategy: "input" | "not-allowed" | "autogen" | "with-default";
}

export type RelationCardinality = "one" | "optional" | "many";
export type RelationDirection = "->" | "<-";
export type RelationDeleteStrategy = "disconnect" | "no-delete" | "cascade";

export interface RelationTypeInfo {
  to: NodeDefinition | AbstractNodeDefinition | NodeUnionDefinition;
  relationship: RelationshipDefinition;
  cardinality: RelationCardinality;
  direction: RelationDirection;
}

export interface RelationDefinition<TTypeInfo extends RelationTypeInfo> {
  kind: "Relation";
  __typeInfo: TTypeInfo;
  to: NodeDefinitionClass | AbstractNodeDefinitionClass | NodeUnionDefinitionClass;
  relationship: RelationshipDefinitionClass;
  cardinality: RelationCardinality;
  direction: RelationDirection;
  deletionStrategy: RelationDeleteStrategy;
}

export function isRelationDefinition(
  value: unknown,
): value is RelationDefinition<RelationTypeInfo> {
  return !!value && typeof value === "object" && "kind" in value && value.kind === "Relation";
}

export type EntityDefinitionClass =
  | NodeDefinitionClass
  | AbstractNodeDefinitionClass
  | NodeUnionDefinitionClass
  | NodeTemplateDefinitionClass
  | RelationshipDefinitionClass
  | AbstractRelationshipDefinitionClass
  | RelationshipUnionDefinitionClass
  | RelationshipTemplateDefinitionClass;

export type EntityDefinition =
  | NodeDefinition
  | AbstractNodeDefinition
  | NodeUnionDefinition
  | NodeTemplateDefinition
  | RelationshipDefinition
  | AbstractRelationshipDefinition
  | RelationshipUnionDefinition
  | RelationshipTemplateDefinition;
