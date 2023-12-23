import { Definition, RelationshipDefinition } from "@schema/definition";
import { RelationCardinality } from "@schema/relation";
import { GraphNode, NodeValue, Optional } from "@cypher/types";
import { Query } from "@core";
import { CreatedRelationship } from "@cypher/mutation";
import { constructorOf } from "@utils/ConstructorOf";
import { isNotNull } from "@cypher/expression";
import { RelationOperation } from "@cypher/mutation/core/RelationOperation";
import { subquery } from "@cypher/query";
import { $effect, $subquery, $where } from "@cypher/stages";
import { $create } from "@cypher/stages/unsafe/$create";
import { creationPattern } from "@cypher/pattern/creation-pattern-builder";
import { $handleMutation } from "@cypher/mutation/utils/$handleMutation";

export class RelateToOperation<
  TNode extends Definition<"node" | "abstract-node" | "node-interface" | "node-union">,
  TRelationship extends RelationshipDefinition | null,
  TCard extends RelationCardinality,
> extends RelationOperation {
  private declare _typeInfo: [TNode, TRelationship, TCard];

  constructor(
    relateTo: NodeValue | Optional<NodeValue> | Query<NodeValue | Optional<NodeValue>, any>,
    relationshipDataResolver: ((node: NodeValue) => CreatedRelationship<any>) | null,
  ) {
    super(({ entityValue, relationModel }) => {
      if (!(entityValue instanceof NodeValue))
        throw new Error("relateTo can only be applied to a node");

      const subqueryStart =
        relateTo instanceof Query
          ? subquery({
              currentNode: entityValue,
            }).pipe(() => $subquery(":relateTo", relateTo))
          : subquery({
              currentNode: entityValue,
              relateTo,
            });

      let subqueryComplete = subqueryStart
        .pipe(row => $where(isNotNull(row.relateTo)))
        .pipe(row =>
          $create(
            creationPattern()
              .node(row.currentNode)
              .newRelationship(
                constructorOf(relationModel.relationship.definition), // todo make helper function for this
                relationModel.direction,
                ":rel",
              )
              .newNode(
                constructorOf(relationModel.to.definition) as unknown as string, // todo maybe should cast to string to trick type system into making UntypedNode
                ":newNode",
              ),
          ),
        );

      if (relationshipDataResolver !== null) {
        const { data: relationshipData, relationshipModel } = CreatedRelationship.getData(
          relationshipDataResolver(entityValue),
        );

        subqueryComplete = subqueryComplete.pipe(row =>
          $handleMutation({
            entityValue: row.rel,
            data: relationshipData,
            entityModel: relationshipModel,
            mutationType: "create",
          }),
        );
      }

      return [$effect(subqueryComplete)];
    });
  }
}

export const relateTo = <
  TNodeInput extends NodeInput,
  TRelationshipInput extends CreatedRelationship<any> | null = null,
>(
  node: TNodeInput,
  relationship?: TRelationshipInput,
): RelateToOperation<
  GetNodeDef<TNodeInput>,
  TRelationshipInput extends CreatedRelationship<infer TRelDef> ? TRelDef : null,
  GetCardinality<TNodeInput>
> => new RelateToOperation(node, (relationship as any) ?? null);

/*
  INTERNAL TYPES
 */

type NodeInput = NodeValue | Optional<NodeValue> | Query<NodeValue | Optional<NodeValue>, any>;

type GetNodeDef<T extends NodeInput> = T extends Optional<GraphNode<infer TNode>>
  ? TNode
  : T extends GraphNode<infer TNode>
  ? TNode
  : T extends Array<GraphNode<infer TNode>>
  ? TNode
  : T extends Query<infer TData, any>
  ? TData extends GraphNode<infer TNode>
    ? TNode
    : TData extends Optional<GraphNode<infer TNode>>
    ? TNode
    : never
  : never;

type GetCardinality<T extends NodeInput> = T extends NodeValue
  ? "one"
  : T extends Optional<NodeValue>
  ? "optional"
  : T extends Array<NodeValue>
  ? "many"
  : T extends Query<infer TData, infer TCardinality>
  ? TCardinality extends "many"
    ? "many"
    : TData extends Optional<NodeValue>
    ? "optional"
    : "one"
  : never;
