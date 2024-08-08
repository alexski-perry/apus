import { NodeSubtypes, RelationshipSubtypes } from "@schema/definition";

export interface NodeConfig<
  TLabel extends string,
  TSubtypes extends NodeSubtypes | undefined,
> {
  configType: "Node";
  label: TLabel;
  additionalLabels?: string[];
  subtypes: TSubtypes;
}

export interface AbstractNodeConfig<
  TIdentifier extends string,
  TSubtypes extends NodeSubtypes | undefined,
> {
  configType: "AbstractNode";
  identifier: TIdentifier;
  passOnLabel: boolean | string | string[];
  subtypes: TSubtypes;
}

export interface NodeUnionConfig<TSubtypes extends NodeSubtypes> {
  configType: "NodeUnion";
  subtypes: TSubtypes;
}

export interface NodeTemplateConfig {
  configType: "NodeTemplate";
}

export interface RelationshipConfig<TName extends string> {
  configType: "Relationship";
  name: TName;
}

export interface AbstractRelationshipConfig<
  TIdentifier extends string,
  TSubtypes extends RelationshipSubtypes | undefined,
> {
  configType: "AbstractRelationship";
  identifier: TIdentifier;
  subtypes: TSubtypes;
}

export interface RelationshipUnionConfig<TSubtypes extends RelationshipSubtypes> {
  configType: "RelationshipUnion";
  subtypes: TSubtypes;
}

export interface RelationshipTemplateConfig {
  configType: "RelationshipTemplate";
}

export function node<
  TLabel extends string,
  TSubtypes extends NodeSubtypes | undefined,
>(config: {
  label: TLabel;
  additionalLabels?: string[];
  subtypes?: TSubtypes;
}): NodeConfig<TLabel, TSubtypes> {
  return {
    configType: "Node",
    label: config.label,
    additionalLabels: config.additionalLabels,
    // @ts-expect-error
    subtypes: config.subtypes,
  };
}

export function abstract_node<
  TIdentifier extends string,
  const TSubtypes extends NodeSubtypes | undefined,
>(config: {
  identifier: TIdentifier;
  passOnLabel?: boolean | string | string[];
  subtypes?: TSubtypes;
}): AbstractNodeConfig<TIdentifier, TSubtypes> {
  return {
    configType: "AbstractNode",
    identifier: config.identifier,
    // @ts-expect-error
    subtypes: config.subtypes,
    passOnLabel: config.passOnLabel ?? false,
  };
}

export function node_union<const TSubtypes extends NodeSubtypes>(
  ...subtypes: TSubtypes
): NodeUnionConfig<any> {
  return {
    configType: "NodeUnion",
    subtypes,
  };
}

export function node_template(): NodeTemplateConfig {
  return {
    configType: "NodeTemplate",
  };
}

export function relationship<TName extends string>(config: {
  name: TName;
}): RelationshipConfig<TName> {
  return {
    configType: "Relationship",
    name: config.name,
  };
}

export function abstract_relationship<
  TIdentifier extends string,
  const TSubtypes extends RelationshipSubtypes | undefined,
>(config: {
  identifier: TIdentifier;
  subtypes?: TSubtypes;
}): AbstractRelationshipConfig<TIdentifier, TSubtypes> {
  return {
    configType: "AbstractRelationship",
    identifier: config.identifier,
    // @ts-expect-error
    subtypes: config.subtypes,
  };
}

export function relationship_union<const TSubtypes extends RelationshipSubtypes>(
  ...subtypes: TSubtypes
): RelationshipUnionConfig<any> {
  return {
    configType: "RelationshipUnion",
    subtypes,
  };
}

export function relationship_template(): RelationshipTemplateConfig {
  return {
    configType: "RelationshipTemplate",
  };
}
