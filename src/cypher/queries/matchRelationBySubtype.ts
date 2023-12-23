import { GetQueryData, Query } from "@core";
import { GraphNode, StringLiteral, Union } from "@cypher/types";
import { NodeLikeDefinition, RelationshipDefinition } from "@schema/definition";
import { RelationCardinality } from "@schema/relation";
import { Deconstruct } from "@utils/deconstruct";
import { RelationPattern } from "@cypher/pattern/relation-pattern";

export declare const matchRelationBySubtype: <
  TNode extends NodeLikeDefinition,
  TRel extends RelationshipDefinition,
  TCard extends RelationCardinality,
  TData extends "$subtypes" extends keyof TNode
    ? {
        [K in keyof TNode["$subtypes"]]: (
          query: Query<
            //@ts-expect-error
            GraphNode<Deconstruct<TNode["$subtypes"][K]>>,
            TCard extends "many" ? "many" : "one"
          >,
          // @ts-expect-error
          kind: "$name" extends keyof Deconstruct<TNode["$subtypes"][K]>
            ? //@ts-expect-error
              StringLiteral<Deconstruct<TNode["$subtypes"][K]>["$name"]>
            : unknown,
        ) => Query<any, any>;
      }
    : {},
>(
  pattern: RelationPattern<TNode, TRel, TCard>,
  input: TData,
) => Query<
  Union<
    {
      // @ts-expect-error
      [K in keyof TData]: GetQueryData<ReturnType<TData[K]>>;
    }[keyof TData]
  >,
  "many"
>;
