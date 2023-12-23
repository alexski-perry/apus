import { ConstructorOf } from "@utils/ConstructorOf";
import { RelationCardinality, RelationDeleteStrategy, RelationDirection } from "../relation";
import { Definition } from "../definition";
import { AllowedPropertyValue, Boolean } from "@cypher/types";
import { Value } from "@core";

export type EntityModel = NodeLikeModel | NodeUnionModel | RelationshipModel;

export type NodeLikeModel = NodeModel | AbstractNodeModel | NodeInterfaceModel;
export type NodeLikeOrUnionModel =
  | NodeModel
  | AbstractNodeModel
  | NodeInterfaceModel
  | NodeUnionModel;

export interface NodeModel {
  kind: "node";
  debugName: string;
  supertype: NodeModel | AbstractNodeModel | NodeInterfaceModel | null;
  subtypes: Record<string, NodeModel>;
  label: string;
  properties: Record<string, PropertyModel>;
  relations: Record<string, RelationModel>;
  definition: Definition<"node">;
}

export interface AbstractNodeModel {
  kind: "abstract-node";
  debugName: string;
  supertype: NodeModel | AbstractNodeModel | NodeInterfaceModel | null;
  subtypes: Record<string, AbstractNodeModel | NodeModel>;
  label: string;
  properties: Record<string, PropertyModel>;
  relations: Record<string, RelationModel>;
  definition: Definition<"abstract-node">;
}

export interface NodeInterfaceModel {
  kind: "node-interface";
  debugName: string;
  supertype: NodeModel | AbstractNodeModel | NodeInterfaceModel | null;
  subtypes: Record<string, NodeInterfaceModel | AbstractNodeModel | NodeModel>;
  properties: Record<string, PropertyModel>;
  relations: Record<string, RelationModel>;
  definition: Definition<"node-interface">;
}

export interface NodeUnionModel {
  kind: "node-union";
  debugName: string;
  subtypes: Record<string, NodeInterfaceModel | AbstractNodeModel | NodeModel>;
  definition: Definition<"node-union">;
}

export interface RelationshipModel {
  kind: "relationship";
  debugName: string;
  name: string;
  properties: Record<string, PropertyModel>;
  definition: Definition<"relationship">;
}

export interface PropertyModel {
  name: string;
  key: string;
  isOwn: boolean;
  type: ConstructorOf<AllowedPropertyValue>;
  creationStrategy:
    | { kind: "input" }
    | { kind: "autogen"; autogenValue: any; canOverride: boolean };
  updateStrategy:
    | { kind: "input" }
    | { kind: "not-allowed" }
    | { kind: "autogen"; autogenValue: any; canOverride: boolean };
  validate?: (val: Value) => Boolean;
}

export interface RelationModel {
  key: string;
  isOwn: boolean;
  to: NodeModel | NodeInterfaceModel | AbstractNodeModel | NodeUnionModel;
  cardinality: RelationCardinality;
  direction: RelationDirection;
  relationship: RelationshipModel;
  deletionStrategy: RelationDeleteStrategy;
}
