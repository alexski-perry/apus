import { Deconstruct } from "@utils/deconstruct";
import { RelationPattern } from "@cypher/pattern/relation-pattern";
import { Query } from "@core/query";
import { Node } from "@cypher/types/structural/node";
import { StringLiteral } from "@cypher/types/scalar/string";
import { Union } from "@cypher/types/union";
import {
  AbstractNodeDefinitionClass,
  NodeDefinitionClass,
  NodeUnionDefinitionClass,
  RelationCardinality,
  RelationshipDefinition,
} from "@schema/definition";
import { DefinitionFromClass } from "@schema/utils";

// todo matchRelationBySubtype
export declare const matchRelationBySubtype: <
  TNode extends NodeDefinitionClass | AbstractNodeDefinitionClass | NodeUnionDefinitionClass,
  TRel extends RelationshipDefinition,
  TCard extends RelationCardinality,
  TData extends "$subtypes" extends keyof TNode
    ? {
        [K in keyof TNode["$subtypes"]]: (
          query: Query<
            //@ts-expect-error
            Node<Deconstruct<TNode["$subtypes"][K]>>,
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
  pattern: RelationPattern<DefinitionFromClass<TNode>, TRel, TCard>,
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
