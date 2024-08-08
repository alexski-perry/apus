import { RelationOperation } from "@cypher/mutation/operations/RelationOperation";
import { Query } from "@core/query";
import { Value } from "@core/value";
import {
  CreatedRelationship,
  GetCreatedRelationshipDefinition,
} from "@cypher/mutation/createRelationship";
import {
  GetNodeDefinitionFromRelationInput,
  RelationInput,
} from "@cypher/mutation/utils/RelationInput";
import {
  AbstractNodeDefinition,
  NodeDefinition,
  NodeUnionDefinition,
  RelationCardinality,
  RelationshipDefinition,
} from "@schema/definition";
import { Clause } from "@core/clause";
import { disconnectAll } from "@cypher/mutation/operations/disconnect-all";
import { relateTo } from "@cypher/mutation/operations/relate-to";

export const replace = <
  TReplaceWith extends RelationInput,
  TRelationshipInput extends CreatedRelationship<any> | null = null,
>(
  node: TReplaceWith,
  relationship?: TRelationshipInput,
): ReplaceOperation<
  GetNodeDefinitionFromRelationInput<TReplaceWith>,
  GetCreatedRelationshipDefinition<TRelationshipInput>,
  ReplaceCardinality<TReplaceWith>
> => new ReplaceOperation(node, (relationship as any) ?? null);

export class ReplaceOperation<
  TNode extends NodeDefinition | AbstractNodeDefinition | NodeUnionDefinition,
  TRelationship extends RelationshipDefinition | null,
  TCardinality extends Exclude<RelationCardinality, "optional">,
> extends RelationOperation {
  protected _typeInfo: [TNode, TRelationship, TCardinality] = null as any;

  constructor(replaceWith: RelationInput, relationship: CreatedRelationship<any> | null) {
    super(({ relationModel, targetVariable, targetModel, resolveInfo }) => {
      const disconnectAllClauses = RelationOperation.getClauses(disconnectAll(), {
        relationModel,
        targetVariable,
        targetModel,
        resolveInfo,
      });

      const relateToClauses: Clause[] = RelationOperation.getClauses(
        relateTo(replaceWith, relationship),
        {
          relationModel,
          targetVariable,
          targetModel,
          resolveInfo,
        },
      );

      return [...disconnectAllClauses, ...relateToClauses];
    });
  }
}

/*
  INTERNAL TYPES
 */

type ReplaceCardinality<T extends RelationInput> = T extends Value
  ? "one"
  : T extends Query<any, infer TCardinality>
    ? TCardinality extends "many"
      ? "many"
      : "one"
    : never;
