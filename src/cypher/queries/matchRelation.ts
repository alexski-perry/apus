import { ConvertRelationCardinality, RelationPattern } from "@cypher/pattern/relation-pattern";
import {
  AbstractNodeDefinition,
  NodeDefinition,
  NodeUnionDefinition,
  RelationCardinality,
  RelationshipDefinition,
} from "@schema/definition";
import { Query, query_untyped } from "@core/query";
import {
  $forceCardinality,
  match,
  Node,
  Optional,
  optionalMatch,
  Relationship,
} from "neo4j-querier";

export function matchRelation<
  TNode extends NodeDefinition | AbstractNodeDefinition | NodeUnionDefinition,
  TRelationship extends RelationshipDefinition,
  TCardinality extends RelationCardinality,
  TWithRelationship extends boolean = false,
>(
  pattern: RelationPattern<TNode, TRelationship, TCardinality>,
  // @ts-expect-error
  withRelationship: TWithRelationship = false,
): TWithRelationship extends true
  ? Query<[Node<TNode>, Relationship<TRelationship>], ConvertRelationCardinality<TCardinality>>
  : Query<Node<TNode>, ConvertRelationCardinality<TCardinality>> {
  const relationModel = RelationPattern.getModel(pattern);

  const patternActual = withRelationship ? pattern.withRelationship : pattern;

  // todo make RelationCardinality the same as QueryCardinality
  return query_untyped(match(patternActual), () =>
    $forceCardinality(
      {
        one: "one" as const,
        optional: "none-or-one" as const,
        many: "many" as const,
      }[relationModel.cardinality],
    ),
  );
}

export function optionalMatchRelation<
  TNode extends NodeDefinition | AbstractNodeDefinition | NodeUnionDefinition,
  TRelationship extends RelationshipDefinition,
  TCardinality extends RelationCardinality,
  TWithRelationship extends boolean = false,
>(
  pattern: RelationPattern<TNode, TRelationship, TCardinality>,
  // @ts-expect-error
  withRelationship: TWithRelationship = false,
): TWithRelationship extends true
  ? Query<
      [Optional<Node<TNode>>, Optional<Relationship<TRelationship>>],
      OptionalMatchCardinality<TCardinality>
    >
  : Query<Optional<Node<TNode>>, OptionalMatchCardinality<TCardinality>> {
  const relationModel = RelationPattern.getModel(pattern);

  const patternActual = withRelationship ? pattern.withRelationship : pattern;

  return query_untyped(optionalMatch(patternActual), () =>
    $forceCardinality(
      {
        one: "one" as const,
        optional: "one" as const,
        many: "one-or-more" as const,
      }[relationModel.cardinality],
    ),
  );
}

/*
  INTERNAL
 */

type OptionalMatchCardinality<T extends RelationCardinality> = {
  one: "one";
  optional: "one";
  many: "one-or-more";
}[T];
