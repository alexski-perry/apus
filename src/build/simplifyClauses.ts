import { Clause, withClause } from "@core/clause";

export function simplifyClauses(prevClauses: Clause[]): Clause[] {
  const clauses: Clause[] = [];

  function addWildcardWith() {
    clauses.push(withClause([], { hasWildcard: true }));
  }

  for (const clause of prevClauses) {
    const lastClause = clauses[clauses.length - 1];
    const secondLastClause = clauses[clauses.length - 2];

    if (lastClause?.type === "RETURN") {
      throw new Error("can't add clause after RETURN");
    }

    if (clause.type === "WITH") {
      const isTrivial = !clause.isDistinct && !clause.mappings.some(val => !!val.input);
      if (!isTrivial) {
        clauses.push(clause);
      }
    } else if (clause.type === "RETURN") {
      clauses.push(clause);
      // todo reconsider whether to merge WITH and RETURN clauses
      // if (prevClause?.type === "WITH" && !prevClause?.isDistinct) {
      //   clauses[clauses.length - 1] = {
      //     type: "RETURN",
      //     isDistinct: clause.isDistinct,
      //     mappings: [...prevClause.mappings, ...clause.mappings],
      //   };
      // } else {
      //   clauses.push(clause);
      // }
    } else if (clause.type === "CALL SUBQUERY" || clause.type === "UNION SUBQUERY") {
      if (
        lastClause?.type === "SET" ||
        lastClause?.type === "REMOVE" ||
        lastClause?.type === "CREATE" ||
        lastClause?.type === "DELETE"
      ) {
        addWildcardWith();
      }

      clauses.push(clause);
    } else if (clause.type === "WHERE") {
      const needsWith =
        lastClause?.type !== "WITH" &&
        lastClause?.type !== "WHERE" &&
        lastClause?.type !== "MATCH";

      if (needsWith) {
        addWildcardWith();
      }

      if (lastClause?.type === "WHERE") {
        clauses[clauses.length - 1] = {
          type: "WHERE",
          predicates: [...lastClause.predicates, ...clause.predicates],
        };
      } else {
        clauses.push(clause);
      }
    } else if (clause.type === "ORDER BY") {
      const needsWith =
        !(lastClause?.type === "WITH") &&
        !(lastClause?.type === "WHERE" && secondLastClause?.type === "WITH") &&
        !(lastClause?.type === "ORDER BY");

      if (needsWith) addWildcardWith();

      if (lastClause?.type === "ORDER BY") {
        clauses[clauses.length - 1] = {
          type: "ORDER BY",
          orderings: [...lastClause.orderings, ...clause.orderings],
        };
      } else {
        clauses.push(clause);
      }
    } else if (clause.type === "SKIP") {
      const needsWith =
        !(lastClause?.type === "WITH") &&
        !(lastClause?.type === "ORDER BY" && secondLastClause?.type === "WITH");

      if (needsWith) addWildcardWith();

      clauses.push(clause);
    } else if (clause.type === "LIMIT") {
      const needsWith =
        !(lastClause?.type === "SKIP") &&
        !(lastClause?.type === "WITH") &&
        !(lastClause?.type === "ORDER BY" && secondLastClause?.type === "WITH");

      if (needsWith) addWildcardWith();

      clauses.push(clause);
    } else {
      clauses.push(clause);
    }
  }

  return clauses;
}
