import { RelationOperation } from "@cypher/mutation/core/RelationOperation";

export class RemoveOperation extends RelationOperation {
  private declare _typeInfo: "Remove";
}

export declare const remove: () => RemoveOperation;
