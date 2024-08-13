import { patternVariableDeclaration } from "@core/pattern/pattern-variable-declaration";
import { Node, NodeValue } from "@cypher/types/structural/node";
import { MatchPattern } from "@core/pattern/match-pattern";
import { getDefinitionClass, RelationModel } from "@schema/model";
import {
  AbstractNodeDefinition,
  NodeDefinition,
  NodeUnionDefinition,
  RelationCardinality,
  RelationshipDefinition,
} from "@schema/definition";
import { Relationship, RelationshipValue } from "@cypher/types/structural/relationship";
import { getNodeLabelsForMatching } from "@schema/utils";

export class RelationPattern<
  TNode extends NodeDefinition | AbstractNodeDefinition | NodeUnionDefinition,
  TRelationship extends RelationshipDefinition,
  TCardinality extends RelationCardinality,
> extends MatchPattern<Node<TNode>> {
  private _cardinalityTag: TCardinality = null as any;
  public withRelationship: MatchPattern<[Node<TNode>, Relationship<TRelationship>]>;

  constructor(
    from: NodeValue,
    private model: RelationModel,
  ) {
    const toNodeVariable = patternVariableDeclaration(
      NodeValue.makeType(getDefinitionClass(model.to)),
    );

    super({
      outputShape: toNodeVariable,
      parts: [
        {
          entityType: "node",
          value: from,
          nodeLabels: [],
        },
        {
          entityType: "relationship",
          direction: model.direction,
          value: null,
          relationshipNames: [model.relationship.name],
        },
        {
          entityType: "node",
          value: toNodeVariable,
          nodeLabels: getNodeLabelsForMatching(model.to),
        },
      ],
    });

    const relationshipVariable = patternVariableDeclaration(
      RelationshipValue.makeType(getDefinitionClass(model.relationship)),
    );

    this.withRelationship = new MatchPattern({
      outputShape: [toNodeVariable, relationshipVariable],
      parts: [
        {
          entityType: "node",
          value: from,
          nodeLabels: [],
        },
        {
          entityType: "relationship",
          direction: model.direction,
          value: relationshipVariable,
          relationshipNames: [model.relationship.name],
        },
        {
          entityType: "node",
          value: toNodeVariable,
          nodeLabels: getNodeLabelsForMatching(model.to),
        },
      ],
    });
  }

  static getModel(relationPattern: RelationPattern<any, any, any>) {
    return relationPattern.model;
  }
}

export type ConvertRelationCardinality<T extends RelationCardinality> = {
  one: "one";
  optional: "none-or-one";
  many: "many";
}[T];

export type GetRelationPatternCardinality<T extends RelationPattern<any, any, any>> =
  T extends RelationPattern<any, any, infer TCardinality>
    ? TCardinality extends RelationCardinality
      ? TCardinality
      : never
    : never;
