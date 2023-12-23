import { Any, NodeUnionValue, NodeValue, String } from "@cypher/types";
import { mergeIntoQueryStage, QueryStage } from "@core/query-stage";
import { getNodeConcreteSubtypes, loadNodeLikeOrUnionModel } from "@schema/models";
import { subquery } from "@cypher/query";
import { $optionalMatch } from "@cypher/stages/$match";
import { pattern } from "@cypher/pattern/match-pattern-builder";
import { constructorOf } from "@utils/ConstructorOf";
import { $where } from "@cypher/stages/$where";
import { Query } from "@core";
import { $delete } from "@cypher/stages/unsafe/$delete";
import { anyProp, hasLabel, isNotNull } from "@cypher/expression";
import { $effect } from "@cypher/stages/$effect";
import { $callProcedure } from "@cypher/stages/$callProcedure";
import { parameterize } from "@cypher/expression/param";
import { expression } from "@cypher/expression/core";

export const $deleteNode = (
  node: NodeValue | NodeUnionValue,
): QueryStage<void, "same", "merge"> => {
  const definition =
    node instanceof NodeValue
      ? NodeValue.getDefinition(node)
      : NodeUnionValue.getDefinition(node);

  // untyped node
  if (typeof definition === "string") {
    return $deleteNode(node);
  }

  const model = loadNodeLikeOrUnionModel(definition);
  const concreteSubtypes = getNodeConcreteSubtypes(model);

  console.log(concreteSubtypes);

  let deleteQuery = subquery(node);

  concreteSubtypes.forEach(subtypeModel => {
    // todo also need to filter out child concrete subtypes
    let subtypeQuery = subquery(node).pipe(node => $where(hasLabel(node, subtypeModel.label)));

    const addEffect = (query: Query<any, any>) => {
      subtypeQuery = subtypeQuery.pipe(() => $effect(query));
    };

    Object.values(subtypeModel.relations).forEach(relationModel => {
      const relationQuery = subquery({ from: node }).pipe(({ from }) =>
        $optionalMatch(
          pattern()
            .node(from)
            .newRelationship(
              constructorOf(relationModel.relationship.definition), // todo use helper function such as dynamic()
              relationModel.direction,
              ":rel",
            )
            .newNode(constructorOf(relationModel.to.definition) as unknown as string, ":to"), // todo use helper function such as dynamic()
        ),
      );

      if (relationModel.deletionStrategy === "no-delete") {
        addEffect(
          relationQuery.pipe(({ rel, from }) =>
            $callProcedure("apoc.util.validate", [
              isNotNull(rel),
              parameterize(
                `Can't delete '${subtypeModel.debugName}' with ID '%s' because one or more '${relationModel.key}' relations exist`,
                String,
              ),
              expression(Any)`[${anyProp(from, "id")}]`,
            ]),
          ),
        );
      }

      if (relationModel.deletionStrategy === "disconnect") {
        addEffect(relationQuery.pipe(({ rel }) => $delete(rel)));
      }

      if (relationModel.deletionStrategy === "cascade") {
        throw new Error("cascading not supported yet"); // todo decide whether to support
      }
    });

    deleteQuery = deleteQuery.pipe(() => $effect(subtypeQuery));
  });

  return mergeIntoQueryStage(deleteQuery.pipe(node => $delete(node)));
};
