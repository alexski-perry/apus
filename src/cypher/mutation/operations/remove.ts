import { RelationOperation } from "@cypher/mutation/operations/RelationOperation";
import { disconnectAll } from "@cypher/mutation/operations/disconnect-all";

export class RemoveOperation extends RelationOperation {
  private declare _typeInfo: "RemoveOperation";

  constructor() {
    super(data => {
      return RelationOperation.getClauses(disconnectAll(), data);
    });
  }
}

export const remove = () => new RemoveOperation();
