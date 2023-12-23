import { ValueData, Variable } from "@core/value-data";
import { ClauseList } from "@core/clause-list";
import { CreationPatternDirection, MatchPatternDirection } from "@core/pattern";

export type AnnotatedClause = {
  clause: Clause;
  level: number;
};

export type Clause =
  | BaseClause<null>
  | MatchClause
  | WithClause
  | ImportWithClause
  | WildcardWithClause
  | ReturnClause
  | OrderByClause
  | WhereClause
  | CallSubqueryClause
  | UnionSubqueryClause
  | CallProcedureClause
  | CreateClause
  | SetPropertyClause
  | SetLabelClause
  | DeleteClause
  | RemovePropertyClause
  | RemoveLabelClause
  | SkipClause
  | LimitClause
  | UnwindClause;

interface BaseClause<T extends string | null> {
  type: T;
}

/*
  HELPERS
 */

export type MatchPattern = Array<
  | {
      entityType: "node";
      variable: Variable | null;
      nodeLabels: string | string[] | null;
    }
  | {
      entityType: "relationship";
      variable: Variable | null;
      direction: MatchPatternDirection;
      relationshipNames: string | string[] | null;
    }
>;

export type CreateClausePattern = Array<
  | {
      entityType: "node";
      variable: Variable | null;
      nodeLabels: string | string[] | null;
    }
  | {
      entityType: "relationship";
      variable: Variable | null;
      direction: CreationPatternDirection;
      relationshipNames: string;
    }
>;

export type ClauseMapping = { output: Variable; input?: ValueData };
export type ClauseOrdering = { expression: ValueData; direction: "ASC" | "DESC" };
export type Predicate = ValueData;
export type ProcedureArg = ValueData;
export type ProcedureResult = { name: string; output: Variable };

/*
  THE CLAUSES
 */

export interface MatchClause extends BaseClause<"MATCH"> {
  patterns: Array<MatchPattern>;
  isOptional: boolean;
}

export const matchClause = (
  patterns: Array<MatchPattern>,
  options?: { isOptional: boolean },
): MatchClause => ({
  type: "MATCH",
  patterns,
  isOptional: options?.isOptional ?? false,
});

export interface WithClause extends BaseClause<"WITH"> {
  mappings: Array<ClauseMapping>;
  isDistinct: boolean;
}

export const withClause = (
  mappings: Array<ClauseMapping>,
  options?: { isDistinct: boolean },
): WithClause => ({
  type: "WITH",
  mappings,
  isDistinct: options?.isDistinct ?? false,
});

export interface ImportWithClause extends BaseClause<"IMPORT WITH"> {
  variables: Array<Variable>;
}

export const importWithClause = (variables: Array<Variable>): ImportWithClause => ({
  type: "IMPORT WITH",
  variables,
});

export interface WildcardWithClause extends BaseClause<"WILDCARD WITH"> {}

export const wildcardWithClause = (): WildcardWithClause => ({
  type: "WILDCARD WITH",
});

export interface ReturnClause extends BaseClause<"RETURN"> {
  mappings: Array<ClauseMapping>;
  isDistinct: boolean;
}

export const returnClause = (
  mappings: Array<ClauseMapping>,
  options?: { isDistinct: boolean },
): ReturnClause => ({
  type: "RETURN",
  mappings,
  isDistinct: options?.isDistinct ?? false,
});

export interface OrderByClause extends BaseClause<"ORDER BY"> {
  orderings: Array<ClauseOrdering>;
}

export const orderByClause = (orderings: Array<ClauseOrdering>): OrderByClause => ({
  type: "ORDER BY",
  orderings,
});

export interface WhereClause extends BaseClause<"WHERE"> {
  predicates: Array<Predicate>;
}

export const whereClause = (predicates: Array<Predicate>): WhereClause => ({
  type: "WHERE",
  predicates,
});

export interface CallSubqueryClause extends BaseClause<"CALL SUBQUERY"> {
  clauses: ClauseList;
}

export const callSubqueryClause = (clauses: ClauseList): CallSubqueryClause => ({
  type: "CALL SUBQUERY",
  clauses,
});

export interface UnionSubqueryClause extends BaseClause<"UNION SUBQUERY"> {
  subqueries: Array<ClauseList>;
}

export const unionSubqueryClause = (subqueries: Array<ClauseList>): UnionSubqueryClause => ({
  type: "UNION SUBQUERY",
  subqueries,
});

export interface CallProcedureClause extends BaseClause<"CALL PROCEDURE"> {
  name: string;
  args: Array<ProcedureArg>;
  yields: Array<ProcedureResult>;
}

export const callProcedureClause = (data: {
  name: string;
  args: Array<ProcedureArg>;
  yields: Array<ProcedureResult>;
}): CallProcedureClause => ({
  type: "CALL PROCEDURE",
  ...data,
});

export interface CreateClause extends BaseClause<"CREATE"> {
  patterns: Array<CreateClausePattern>;
}

export const createClause = (patterns: Array<CreateClausePattern>): CreateClause => ({
  type: "CREATE",
  patterns,
});

export interface SetPropertyClause extends BaseClause<"SET"> {
  entity: Variable;
  propertyName: string;
  value: ValueData;
}

export const setPropertyClause = (data: {
  entity: Variable;
  propertyName: string;
  value: ValueData;
}): SetPropertyClause => ({
  type: "SET",
  ...data,
});

export interface SetLabelClause extends BaseClause<"SET"> {
  node: Variable;
  label: string;
}

export const setLabelClause = (data: { node: Variable; label: string }): SetLabelClause => ({
  type: "SET",
  ...data,
});

export interface DeleteClause extends BaseClause<"DELETE"> {
  entity: Variable;
  isDetach: boolean;
}

export const deleteClause = (
  entity: Variable,
  options?: { isDetach: boolean },
): DeleteClause => ({
  type: "DELETE",
  entity,
  isDetach: options?.isDetach ?? false,
});

export interface RemovePropertyClause extends BaseClause<"REMOVE"> {
  entity: Variable;
  propertyName: string;
}

export const removePropertyClause = (data: {
  entity: Variable;
  propertyName: string;
}): RemovePropertyClause => ({
  type: "REMOVE",
  ...data,
});

export interface RemoveLabelClause extends BaseClause<"REMOVE"> {
  node: Variable;
  label: string;
}

export const removeLabelClause = (data: {
  node: Variable;
  label: string;
}): RemoveLabelClause => ({
  type: "REMOVE",
  ...data,
});

export interface SkipClause extends BaseClause<"SKIP"> {
  value: ValueData;
}

export const skipClause = (value: ValueData): SkipClause => ({
  type: "SKIP",
  value,
});

export interface LimitClause extends BaseClause<"LIMIT"> {
  value: ValueData;
}

export const limitClause = (value: ValueData): LimitClause => ({
  type: "LIMIT",
  value,
});

export interface UnwindClause extends BaseClause<"UNWIND"> {
  list: ValueData;
  output: Variable;
}

export const unwindClause = (data: { list: ValueData; output: Variable }): UnwindClause => ({
  type: "UNWIND",
  ...data,
});
