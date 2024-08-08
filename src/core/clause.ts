import { ValueInfo, Variable } from "@core/value-info";
import { MatchPatternDirection } from "@core/pattern/match-pattern";
import { CreationPatternDirection } from "@core/pattern/creation-pattern";
import { Value } from "@core/value";
import { expression } from "@core/expression";
import { Any } from "@cypher/types/any";

export type Clause =
  | MatchClause
  | WithClause
  | ImportWithClause
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

/*
  HELPERS
 */

interface BaseClause<T extends string> {
  type: T;
}

export type MatchClausePattern = Array<
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

export type ClauseMapping = { output: Variable; input?: ValueInfo };
export type ClauseOrdering = { expression: ValueInfo; direction: "ASC" | "DESC" };
export type Predicate = ValueInfo;
export type ProcedureArg = ValueInfo;
export type ProcedureResult = { name: string; output: Variable };

/*
  THE CLAUSES
 */

export interface MatchClause extends BaseClause<"MATCH"> {
  patterns: Array<MatchClausePattern>;
  isOptional: boolean;
}

export const matchClause = (
  patterns: Array<MatchClausePattern>,
  options?: { isOptional: boolean },
): MatchClause => ({
  type: "MATCH",
  patterns,
  isOptional: options?.isOptional ?? false,
});

export interface WithClause extends BaseClause<"WITH"> {
  mappings: Array<ClauseMapping>;
  isDistinct: boolean;
  hasWildcard: boolean;
}

export const withClause = (
  mappings: Array<ClauseMapping>,
  options?: { isDistinct?: boolean; hasWildcard?: boolean },
): WithClause => ({
  type: "WITH",
  mappings,
  isDistinct: options?.isDistinct ?? false,
  hasWildcard: options?.hasWildcard ?? false,
});

export interface ImportWithClause extends BaseClause<"IMPORT WITH"> {
  variables: Array<Variable>;
}

export const importWithClause = (variables: Array<Variable>): ImportWithClause => ({
  type: "IMPORT WITH",
  variables,
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

export const resetCardinalityReturnClause = (ignoredVariable: Variable): ReturnClause => ({
  type: "RETURN",
  mappings: [
    {
      input: Value.getValueInfo(expression(Any)`count(null)`),
      output: ignoredVariable,
    },
  ],
  isDistinct: false,
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
  clauses: Array<Clause>;
}

export const callSubqueryClause = (clauses: Array<Clause>): CallSubqueryClause => ({
  type: "CALL SUBQUERY",
  clauses,
});

export interface UnionSubqueryClause extends BaseClause<"UNION SUBQUERY"> {
  subqueries: Array<Array<Clause>>;
}

export const unionSubqueryClause = (
  subqueries: Array<Array<Clause>>,
): UnionSubqueryClause => ({
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
  value: ValueInfo;
}

export const setPropertyClause = (data: {
  entity: Variable;
  propertyName: string;
  value: ValueInfo;
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
  value: ValueInfo;
}

export const skipClause = (value: ValueInfo): SkipClause => ({
  type: "SKIP",
  value,
});

export interface LimitClause extends BaseClause<"LIMIT"> {
  value: ValueInfo;
}

export const limitClause = (value: ValueInfo): LimitClause => ({
  type: "LIMIT",
  value,
});

export interface UnwindClause extends BaseClause<"UNWIND"> {
  list: ValueInfo;
  output: Variable;
}

export const unwindClause = (data: { list: ValueInfo; output: Variable }): UnwindClause => ({
  type: "UNWIND",
  ...data,
});
