import { Query } from "@core/query";
import { RelationOperation } from "@cypher/mutation/operations/RelationOperation";
import { handleMutation } from "@cypher/mutation/utils/handleMutation";
import { NodeValue } from "@cypher/types/structural/node";
import { Optional } from "@cypher/types/optional";
import { isNotNull } from "@cypher/expression/operators";
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
import { getDefinitionClass } from "@schema/model";
import { Value } from "@core/value";
import {
  callSubqueryClause,
  Clause,
  createClause,
  importWithClause,
  resetCardinalityReturnClause,
  whereClause,
} from "@core/clause";
import { Any } from "@cypher/types/any";
import { isVariable, Variable } from "@core/value-info";
import { getRelationshipName } from "@schema/utils";
import { RelationshipValue } from "@cypher/types/structural/relationship";

export function relateTo<
  TRelateTo extends RelationInput,
  TRelationship extends CreatedRelationship<any> | null = null,
>(
  node: TRelateTo,
  relationship: TRelationship | null = null,
): RelateToOperation<
  GetNodeDefinitionFromRelationInput<TRelateTo>,
  GetCreatedRelationshipDefinition<TRelationship>,
  RelateToCardinality<TRelateTo>
> {
  return new RelateToOperation(node, relationship);
}

export class RelateToOperation<
  TNode extends NodeDefinition | AbstractNodeDefinition | NodeUnionDefinition,
  TRelationship extends RelationshipDefinition | null,
  TCard extends RelationCardinality,
> extends RelationOperation {
  protected _typeInfo: [TNode, TRelationship, TCard] = null as any;

  constructor(relateTo: RelationInput, relationship: CreatedRelationship<any> | null) {
    super(({ relationModel, targetVariable, resolveInfo }) => {
      const mutationClauses: Clause[] = [];
      let relateToVariable: Variable;

      if (relateTo instanceof Query) {
        const { clauses, outputShape } = resolveInfo.resolveSubquery(relateTo);
        if (!isVariable(outputShape)) {
          throw new Error("relateTo: provided query had unexpected type");
        }
        relateToVariable = outputShape;
        mutationClauses.push(
          importWithClause([targetVariable]),
          callSubqueryClause([importWithClause([targetVariable]), ...clauses]),
        );
      } else {
        relateToVariable = resolveInfo.resolveVariable(relateTo);
        mutationClauses.push(importWithClause([targetVariable, relateToVariable]));
      }

      const relationshipVariable = resolveInfo.defineVariable(
        RelationshipValue.makeType(getDefinitionClass(relationModel.relationship)),
      );



      mutationClauses.push(
        whereClause([
          Value.getValueInfo(isNotNull(Value.create(relateToVariable.type, relateToVariable))),
        ]),
        createClause([
          [
            {
              entityType: "node",
              variable: targetVariable,
              nodeLabels: [],
            },
            {
              entityType: "relationship",
              direction: relationModel.direction,
              variable: relationshipVariable,
              relationshipNames: getRelationshipName(relationModel.relationship),
            },
            {
              entityType: "node",
              variable: relateToVariable,
              nodeLabels: [],
            },
          ],
        ]),
      );

      mutationClauses.push(
        ...handleMutation({
          targetVariable: relationshipVariable,
          data: relationship ? CreatedRelationship.getData(relationship) : {},
          entityModel: relationModel.relationship,
          mutationType: "create",
          resolveInfo,
        }),
      );

      return [
        callSubqueryClause([
          ...mutationClauses,
          resetCardinalityReturnClause(resolveInfo.defineVariable(Any)),
        ]),
      ];
    });
  }
}

/*
  INTERNAL TYPES
 */

type RelateToCardinality<T extends RelationInput> = T extends NodeValue
  ? "one"
  : T extends Optional<NodeValue>
    ? "optional"
    : T extends Query<infer TData, infer TCardinality>
      ? TCardinality extends "many"
        ? "many"
        : TData extends Optional<NodeValue>
          ? "optional"
          : "one"
      : never;
