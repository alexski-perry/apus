import { Id } from "@utils/Id";
import { GetCreateFieldKind } from "@cypher/mutation/utils/GetCreateFieldKind";
import { PropertyField } from "@cypher/mutation/utils/PropertyField";
import { PropertyValue } from "@cypher/types/property";
import { RelationshipModel } from "@schema/model";
import { RelationshipDefinition, RelationshipDefinitionClass } from "@schema/definition";
import { DefinitionFromClass, maybeLoadModel } from "@schema/utils";

export const createRelationship = <TDef extends string | RelationshipDefinitionClass>(
  relationship: TDef,
  data: RelationshipCreateData<DefinitionFromClass<TDef>>,
): CreatedRelationship<TDef extends RelationshipDefinition ? TDef : null> =>
  new CreatedRelationship({
    relationshipModel: maybeLoadModel(relationship),
    data,
  });

export class CreatedRelationship<T extends RelationshipDefinition | null> {
  public declare _typeInfo: [T];

  constructor(
    private _data: {
      relationshipModel: RelationshipModel | null;
      data: Record<string, any>;
    },
  ) {}

  static getData(val: CreatedRelationship<any>) {
    return val._data;
  }
}

export type GetCreatedRelationshipDefinition<T extends CreatedRelationship<any> | null> =
  T extends CreatedRelationship<infer TRelationshipDefinition>
    ? TRelationshipDefinition
    : null;

/*
  INTERNAL TYPES
 */

export type RelationshipCreateData<T extends string | RelationshipDefinition> =
  T extends RelationshipDefinition
    ? TypedRelationshipCreateData<T>
    : UntypedRelationshipCreateData;

type UntypedRelationshipCreateData = {
  [key: string]: PropertyValue;
};

type TypedRelationshipCreateData<T extends RelationshipDefinition> = Id<
  {
    [K in keyof T as GetCreateFieldKind<T[K]> extends "required-prop"
      ? K
      : never]-?: PropertyField<T[K]>;
  } & {
    [K in keyof T as GetCreateFieldKind<T[K]> extends "optional-prop"
      ? K
      : never]+?: PropertyField<T[K]>;
  }
>;
