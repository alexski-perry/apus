import { Query, query_untyped } from "@core/query";
import { Optional } from "@cypher/types/optional";
import { $optionalMatchNode } from "@cypher/operations/$matchNode";
import { $where } from "@cypher/operations/$where";
import { equals, isNull } from "@cypher/expression/operators";
import { propUnsafe } from "@cypher/expression/prop";
import { $throwIf } from "@cypher/operations/procedures/$throwIf";
import { forceType } from "@cypher/expression/casting";
import {
  AbstractNodeDefinitionClass,
  NodeDefinitionClass,
  NodeUnionDefinitionClass,
} from "@schema/definition";
import { Node } from "@cypher/types/structural/node";
import { DefinitionFromClass, getNodeLabelsForMatching } from "@schema/utils";

export const findByID = <
  TDef extends
    | string
    | NodeDefinitionClass
    | AbstractNodeDefinitionClass
    | NodeUnionDefinitionClass,
  TOptions extends FindByIdOptions = {},
>(
  nodeDefinition: TDef,
  id: string | undefined,
  config?: TOptions,
): Query<
  TOptions["optional"] extends true
    ? Optional<Node<DefinitionFromClass<TDef>>>
    : Node<DefinitionFromClass<TDef>>,
  "one"
> => {
  const baseQuery = query_untyped(
    () => $optionalMatchNode(nodeDefinition),
    node => $where(equals(propUnsafe(node, config?.propertyName ?? "id"), id ?? null)),
  );

  if (config && "optional" in config && config["optional"] == true) {
    return baseQuery;
  } else {
    const errorMessage =
      config && "errorMessage" in config
        ? config.errorMessage
        : `Couldn't find node '${getNodeLabelsForMatching(nodeDefinition).join(
            "|",
          )}' with ID '${id}'`;

    return query_untyped(
      baseQuery,
      node => $throwIf(isNull(node), errorMessage),
      node => forceType(node, Optional.getInnerType(node)),
    );
  }
};

type FindByIdOptions = {
  propertyName?: string;
} & (
  | { errorMessage: string; optional?: false }
  | { optional: true; errorMessage?: never }
  | { optional?: false }
);
