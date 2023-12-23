import { Definition, RelationshipDefinition } from "@schema/definition";
import { ConstructorOf } from "@utils/ConstructorOf";
import { loadRelationshipModel } from "@schema/models";
import { Deconstruct } from "@utils/deconstruct";
import { AllowedPropertyValue } from "@cypher/types";
import { Id } from "@utils/Id";
import { GetCreateFieldKind } from "@cypher/mutation/utils/GetCreateFieldKind";
import { PropertyField } from "@cypher/mutation/utils/PropertyField";
import { CreatedRelationship } from "@cypher/mutation/core/CreatedRelationship";

export const relationship = <TRel extends string | ConstructorOf<Definition<"relationship">>>(
  relationship: TRel,
  data: RelationshipCreateData<TRel>,
): CreatedRelationship<TRel extends ConstructorOf<any> ? Deconstruct<TRel> : null> =>
  new CreatedRelationship({
    relationshipModel:
      typeof relationship === "string" ? null : loadRelationshipModel(relationship),
    data,
  });

/*
  INTERNAL TYPES
 */

export type RelationshipCreateData<
  T extends string | ConstructorOf<Definition<"relationship">>,
> = T extends ConstructorOf<any>
  ? TypedRelationshipCreateData<Deconstruct<T>>
  : UntypedRelationshipCreateData;

type UntypedRelationshipCreateData = {
  [key: string]: AllowedPropertyValue;
};

type TypedRelationshipCreateData<T extends RelationshipDefinition> = Id<
  {
    [K in keyof T as GetCreateFieldKind<T[K]> extends "required-prop"
      ? K
      : never]-?: PropertyField<T[K]>;
  } & {
    [K in keyof T as GetCreateFieldKind<T[K]> extends "optional-prop"
      ? K
      : never]+?: PropertyField<T[K]>;
  }
>;
