import { RelationshipDefinition } from "@schema/definition";
import { RelationshipModel } from "@schema/models";

export class CreatedRelationship<T extends RelationshipDefinition | null> {
  private declare _typeInfo: T;

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
