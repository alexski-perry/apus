import { ConstructorOf } from "@utils/ConstructorOf";
import { NodeLikeOrUnionDefinition } from "@schema/definition";
import { anyProp, castNonNull, equals } from "cypher/expression";
import {
  $forceCardinality,
  $matchNode,
  $optionalMatchNode,
  $throwIfNull,
  $where,
} from "@cypher/stages";
import { Query } from "@core";
import { ID, MakeNodeValue, Optional } from "@cypher/types";
import { query } from "@cypher/query";
import { getNodeLabels } from "@schema/models";
import { recastValue } from "@core/utils";

export const findByID = <
  TNode extends string | ConstructorOf<NodeLikeOrUnionDefinition>,
  TOptions extends FindByIdOptions = {},
>(
  nodeDefinition: TNode,
  id: string | undefined,
  config?: TOptions,
): Query<
  TOptions["optional"] extends true ? Optional<MakeNodeValue<TNode>> : MakeNodeValue<TNode>,
  "one"
> => {
  const queryStart = query()
    .pipe(() => $optionalMatchNode("@", nodeDefinition))
    .pipe(node => $where(equals(anyProp(node, config?.propertyName ?? "id", ID), id ?? null)));

  if (config && "optional" in config && config["optional"] == true) {
    return queryStart as Query<any, any>;
  } else {
    const errorMessage =
      config && "errorMessage" in config
        ? config.errorMessage
        : `Couldn't find node '${getNodeLabels(nodeDefinition).join("|")}' with ID '${id}'`;

    return queryStart
      .pipe(node => $throwIfNull(node, errorMessage))
      .pipe(node => recastValue(node, Optional.getInnerType(node))) as Query<any, any>;
  }
};

type FindByIdOptions = {
  propertyName?: string;
} & (
  | { errorMessage: string; optional?: false }
  | { optional: true; errorMessage?: never }
  | { optional?: false }
);
