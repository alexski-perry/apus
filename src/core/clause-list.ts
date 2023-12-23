import { Clause } from "@core/clause";

export class ClauseList {
  private readonly clauses: Clause[];

  public getClauses() {
    return this.clauses;
  }

  private constructor(clauses: Clause[]) {
    this.clauses = clauses;
  }

  static empty() {
    return new ClauseList([]);
  }

  static from(clauses: Array<Clause>) {
    return ClauseList.update(ClauseList.empty(), clauses);
  }

  static update(previous: ClauseList, clauses: Clause[]) {
    const newClauseList = new ClauseList(previous.clauses);
    clauses.forEach(clause => {
      newClauseList.addClause(clause);
    });
    return newClauseList;
  }

  private addClause(newClause: Clause) {
    const clauses = this.clauses;
    const prevClause = clauses[clauses.length - 1];
    const secondPrevClause = clauses[clauses.length - 2];
    const thirdPrevClause = clauses[clauses.length - 3];

    if (prevClause?.type === "RETURN") {
      throw new Error("can't add clause after RETURN");
    }

    if (newClause.type === "WITH") {
      const isTrivial = !newClause.isDistinct && !newClause.mappings.some(val => !!val.input);
      if (!isTrivial) {
        clauses.push(newClause);
      }
    } else if (newClause.type === "RETURN") {
      clauses.push(newClause);
      // todo reconsider whether to merge WITH and RETURN clauses
      // if (prevClause?.type === "WITH" && !prevClause?.isDistinct) {
      //   clauses[clauses.length - 1] = {
      //     type: "RETURN",
      //     isDistinct: newClause.isDistinct,
      //     mappings: [...prevClause.mappings, ...newClause.mappings],
      //   };
      // } else {
      //   clauses.push(newClause);
      // }
    } else if (newClause.type === "CALL SUBQUERY") {
      if (
        prevClause?.type === "SET" ||
        prevClause?.type === "REMOVE" ||
        prevClause?.type === "CREATE" ||
        prevClause?.type === "DELETE"
      ) {
        this.addWildcardWith();
      }

      clauses.push(newClause);
    } else if (newClause.type === "WHERE") {
      const needsWith =
        prevClause?.type !== "WITH" &&
        prevClause?.type !== "WHERE" &&
        prevClause?.type !== "MATCH";

      if (needsWith) {
        this.addWildcardWith();
      }

      if (prevClause?.type === "WHERE") {
        clauses[clauses.length - 1] = {
          type: "WHERE",
          predicates: [...prevClause.predicates, ...newClause.predicates],
        };
      } else {
        clauses.push(newClause);
      }
    } else if (newClause.type === "ORDER BY") {
      const needsWith =
        !(prevClause?.type === "WITH") &&
        !(prevClause?.type === "WHERE" && secondPrevClause?.type === "WITH") &&
        !(prevClause?.type === "ORDER BY");

      if (needsWith) this.addWildcardWith();

      if (prevClause?.type === "ORDER BY") {
        clauses[clauses.length - 1] = {
          type: "ORDER BY",
          orderings: [...prevClause.orderings, ...newClause.orderings],
        };
      } else {
        clauses.push(newClause);
      }
    } else if (newClause.type === "SKIP") {
      const needsWith =
        !(prevClause?.type === "WITH") &&
        !(prevClause?.type === "WHERE" && secondPrevClause?.type === "WITH") &&
        !(
          prevClause?.type === "ORDER BY" &&
          secondPrevClause?.type === "WHERE" &&
          thirdPrevClause?.type === "WITH"
        ) &&
        !(prevClause?.type === "ORDER BY" && secondPrevClause?.type === "WITH");

      if (needsWith) this.addWildcardWith();

      clauses.push(newClause);
    } else if (newClause.type === "LIMIT") {
      const needsWith =
        !(prevClause?.type === "SKIP") &&
        !(prevClause?.type === "WITH") &&
        !(prevClause?.type === "WHERE" && secondPrevClause?.type === "WITH") &&
        !(
          prevClause?.type === "ORDER BY" &&
          secondPrevClause?.type === "WHERE" &&
          thirdPrevClause?.type === "WITH"
        ) &&
        !(prevClause?.type === "ORDER BY" && secondPrevClause?.type === "WITH");

      if (needsWith) this.addWildcardWith();

      clauses.push(newClause);
    } else {
      clauses.push(newClause);
    }

    /*

if (op.type === "union-subquery") {
  const prevClause = clauses[clauses.length - 1];
  if (
    prevClause?.type === "SET" ||
    prevClause?.type === "REMOVE" ||
    prevClause?.type === "CREATE" ||
    prevClause?.type === "DELETE"
  ) {
    addClause({
      type: "WITH",
      expressions: [{ expression: "*" }],
      distinct: false,
    });
  }

  const outputVar = resolve(op.output);

  const subqueryLines: string[] = [];

  const n = op.subqueries.length;
  for (let i = 0; i < n; i++) {
    const subquery = op.subqueries[i]!;
    const { operations, input, output } = Query.get(subquery);

    const subqueryOutput = valueFromQueryData(Union, output);

    subqueryLines.push(
      ...buildQueryLines({
        operations,
        input,
        indentation: indentation + 1,
        context: context,
      }),
      `RETURN ${context.resolveValue(subqueryOutput, indentation + 1)} AS ${outputVar}`,
      ...(i !== n - 1 ? ["  UNION"] : []),
    );
  }

  addClause({
    type: "CALL SUBQUERY",
    subqueryLines,
  });

  flattenQueryData(op.output).forEach(output => {
    state.valuesInScope.add(Value.getId(output));
  });
}

 */
  }

  private addWildcardWith = () => {
    this.clauses.push({
      type: "WILDCARD WITH",
    });
  };
}
