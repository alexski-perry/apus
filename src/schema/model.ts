import { Value } from "@core/value";
import { PropertyValue } from "@cypher/types/property";
import { TypeOf } from "@core/type/type";
import {
  AbstractNodeDefinition,
  AbstractNodeDefinitionClass,
  AbstractRelationshipDefinition,
  AbstractRelationshipDefinitionClass,
  NodeDefinition,
  NodeDefinitionClass,
  NodeUnionDefinition,
  NodeUnionDefinitionClass,
  RelationCardinality,
  RelationDeleteStrategy,
  RelationDirection,
  RelationshipDefinition,
  RelationshipDefinitionClass,
  RelationshipUnionDefinition,
} from "@schema/definition";

// Note: no need to have models for templates

export type EntityModel =
  | NodeModel
  | AbstractNodeModel
  | NodeUnionModel
  | RelationshipModel
  | AbstractRelationshipModel
  | RelationshipUnionModel;

export interface NodeModel {
  kind: "Node";
  label: string;
  additionalLabels: string[];
  supertype: NodeModel | AbstractNodeModel | null;
  subtypes: Array<NodeModel | AbstractNodeModel>;
  properties: Record<string, PropertyModel>;
  relations: Record<string, RelationModel>;
  definitionInstance: NodeDefinition;
}

export interface AbstractNodeModel {
  kind: "AbstractNode";
  identifier: string;
  passedOnLabels: string[];
  supertype: NodeModel | AbstractNodeModel | null;
  subtypes: Array<NodeModel | AbstractNodeModel>;
  properties: Record<string, PropertyModel>;
  relations: Record<string, RelationModel>;
  definitionInstance: AbstractNodeDefinition;
}

export interface NodeUnionModel {
  kind: "NodeUnion";
  subtypes: Array<NodeModel | AbstractNodeModel>;
  definitionInstance: NodeUnionDefinition;
}

export interface RelationshipModel {
  kind: "Relationship";
  name: string;
  supertype: AbstractRelationshipModel | null;
  properties: Record<string, PropertyModel>;
  definitionInstance: RelationshipDefinition;
}

export interface AbstractRelationshipModel {
  kind: "AbstractRelationship";
  identifier: string;
  supertype: AbstractRelationshipModel | null;
  subtypes: Array<RelationshipModel | AbstractRelationshipModel>;
  properties: Record<string, PropertyModel>;
  definitionInstance: AbstractRelationshipDefinition;
}

export interface RelationshipUnionModel {
  kind: "RelationshipUnion";
  subtypes: Array<RelationshipModel | AbstractRelationshipModel>;
  definitionInstance: RelationshipUnionDefinition;
}

export interface PropertyModel {
  kind: "Property";
  name: string;
  key: string;
  type: TypeOf<PropertyValue>;
  creationStrategy:
    | { kind: "input" }
    | { kind: "autogen"; autogenValue: any; canOverride: boolean };
  updateStrategy:
    | { kind: "input" }
    | { kind: "not-allowed" }
    | { kind: "autogen"; autogenValue: any; canOverride: boolean };
  validate?: (val: Value) => Value;
}

export interface RelationModel {
  kind: "Relation";
  key: string;
  to: NodeModel | AbstractNodeModel | NodeUnionModel;
  cardinality: RelationCardinality;
  direction: RelationDirection;
  relationship: RelationshipModel;
  deletionStrategy: RelationDeleteStrategy;
}

type DefinitionClassFromModel<
  T extends
    | NodeModel
    | AbstractNodeModel
    | NodeUnionModel
    | RelationshipModel
    | AbstractRelationshipModel
    | RelationshipUnionModel,
> = T extends NodeModel
  ? NodeDefinitionClass
  : T extends AbstractNodeModel
    ? AbstractNodeDefinitionClass
    : T extends NodeUnionModel
      ? NodeUnionDefinitionClass
      : T extends RelationshipModel
        ? RelationshipDefinitionClass
        : T extends AbstractRelationshipModel
          ? AbstractRelationshipDefinitionClass
          : T extends RelationshipUnionModel
            ? RelationshipUnionDefinition
            : never;

export function getDefinitionClass<
  T extends
    | NodeModel
    | AbstractNodeModel
    | NodeUnionModel
    | RelationshipModel
    | AbstractRelationshipModel
    | RelationshipUnionModel,
>(model: T): DefinitionClassFromModel<T> {
  return model.definitionInstance.constructor as DefinitionClassFromModel<T>;
}
