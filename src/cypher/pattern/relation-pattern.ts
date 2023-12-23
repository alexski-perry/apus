import { getNodeType, GraphRelationship, NodeValue, MakeNodeValue } from "@cypher/types";
import { getNodeLabels, getRelationshipName, RelationModel } from "@schema/models";
import { declarePatternVariable, MatchPattern } from "@core";
import { NodeLikeOrUnionDefinition, RelationshipDefinition } from "@schema/definition";
import { RelationCardinality } from "@schema/relation";
import { getRelationshipType } from "@cypher/types/utils";
import { ConstructorOf } from "@utils/ConstructorOf";

export class RelationPattern<
  TNode extends NodeLikeOrUnionDefinition,
  TRelationship extends RelationshipDefinition,
  TCardinality extends RelationCardinality,
> extends MatchPattern<
  MakeNodeValue<ConstructorOf<TNode>>,
  ConvertRelationCardinality<TCardinality>
> {
  public withRelationship: MatchPattern<
    [MakeNodeValue<ConstructorOf<TNode>>, GraphRelationship<TRelationship>],
    ConvertRelationCardinality<TCardinality>
  >;

  constructor(from: NodeValue, model: RelationModel) {
    const toNodeVariable = declarePatternVariable(getNodeType(model.to));

    const cardinality = {
      one: "one" as const,
      optional: "none-or-one" as const,
      many: "many" as const,
    }[model.cardinality];

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
          relationshipNames: [getRelationshipName(model.relationship)],
        },
        {
          entityType: "node",
          value: toNodeVariable,
          nodeLabels: getNodeLabels(model.to),
        },
      ],
      cardinality,
    });

    const relationshipVariable = declarePatternVariable(
      getRelationshipType(model.relationship),
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
          relationshipNames: [getRelationshipName(model.relationship)],
        },
        {
          entityType: "node",
          value: toNodeVariable,
          nodeLabels: getNodeLabels(model.to),
        },
      ],
      cardinality,
    });
  }
}

type ConvertRelationCardinality<T extends RelationCardinality> = {
  one: "one";
  optional: "none-or-one";
  many: "many";
}[T];
