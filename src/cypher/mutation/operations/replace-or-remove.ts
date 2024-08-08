import { RelationOperation } from "@cypher/mutation/operations/RelationOperation";
import { CreatedRelationship, GetCreatedRelationshipDefinition } from "@cypher/mutation/createRelationship";
import { GetNodeDefinitionFromRelationInput, RelationInput } from "@cypher/mutation/utils/RelationInput";
import {
  AbstractNodeDefinition,
  NodeDefinition,
  NodeUnionDefinition,
  RelationshipDefinition
} from "@schema/definition";

export const replaceOrRemove = <
  TReplaceWith extends RelationInput,
  TRelationshipInput extends CreatedRelationship<any> | null = null,
>(
  node: TReplaceWith,
  relationship?: TRelationshipInput
): ReplaceOrRemoveOperation<
  GetNodeDefinitionFromRelationInput<TReplaceWith>,
  GetCreatedRelationshipDefinition<TRelationshipInput>
> => new ReplaceOrRemoveOperation(node, (relationship as any) ?? null);

export class ReplaceOrRemoveOperation<
  TNode extends NodeDefinition | AbstractNodeDefinition | NodeUnionDefinition,
  TRelationship extends RelationshipDefinition | null,
> extends RelationOperation {
  private declare _typeInfo: [TNode, TRelationship];

  constructor(replaceWith: RelationInput, relationship: CreatedRelationship<any> | null) {
    super(() => []);
    // super(({ relationModel, targetVariable, targetModel, resolveInfo }) => {
    //   const deleteEffect = $effect(
    //     query(
    //       entityValue,
    //       currentNode =>
    //         $optionalMatch(
    //           pattern()
    //             .node(currentNode)
    //             .newRelationship(
    //               getDefinitionClass(relationModel.relationship),
    //               relationModel.direction,
    //               ":rel",
    //             )
    //             .newNode(getDefinitionClass(relationModel.to)),
    //         ),
    //       row => $delete(row.rel),
    //     ),
    //   );
    //
    //   let subqueryStart =
    //     replaceWith instanceof Query
    //       ? query(
    //           {
    //             currentNode: entityValue,
    //           },
    //           () => $subquery(":replaceWith", replaceWith),
    //         )
    //       : query({
    //           currentNode: entityValue,
    //           replaceWith,
    //         });
    //
    //   let subqueryComplete = query(
    //     subqueryStart,
    //     row => $where(isNotNull(row.replaceWith)),
    //     row => ({
    //       ...row,
    //       replaceWith: forceNotOptional(row.replaceWith),
    //     }),
    //     () => $first(),
    //     row =>
    //       $create(
    //         creationPattern()
    //           .node(row.currentNode)
    //           .newRelationship(
    //             getDefinitionClass(relationModel.relationship),
    //             relationModel.direction,
    //             ":rel",
    //           )
    //           .node(row.replaceWith),
    //       ),
    //   );
    //
    //   if (relationship !== null) {
    //     const { data: relationshipData, relationshipModel } =
    //       CreatedRelationship.getData(relationship);
    //
    //     subqueryComplete = query(subqueryComplete, row =>
    //       $effect(
    //         handleMutation({
    //           entityValue: row.rel,
    //           data: relationshipData,
    //           entityModel: relationshipModel,
    //           mutationType: "create",
    //         }),
    //       ),
    //     );
    //   }
    //
    //   return [() => deleteEffect, () => $effect(subqueryComplete)];
    // });
  }
}
