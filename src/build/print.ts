import {
  Clause,
  ClauseMapping,
  ClauseOrdering,
  CreateClausePattern,
  MatchClausePattern,
  ProcedureResult,
} from "@core/clause";
import { castArray } from "@utils/castArray";
import { ValueInfo, Variable } from "@core/value-info";
import { ParamRegistry } from "@build/param-registry";
import { simplifyClauses } from "@build/simplifyClauses";

export function printClauses(
  clauses: Clause[],
  level: number,
  paramRegistry: ParamRegistry,
): string[] {
  const simplifiedClauses = simplifyClauses(clauses);
  const lines: string[] = [];

  const printIndent = (level: number) => "  ".repeat(level);

  const printValue = (value: ValueInfo): string => {
    switch (value.kind) {
      case "variable":
        return printVariable(value);
      case "parameter":
        return paramRegistry.registerAndPrint(value);
      case "expression":
        return value.print(level, {
          printValue: value => printValue(value),
          printIndent,
        });
    }
  };

  const printValueList = (values: ValueInfo[]) =>
    values.map(value => printValue(value)).join(", ");

  const printMappingList = (mappings: ClauseMapping[]) =>
    mappings
      .map(mapping =>
        mapping.input
          ? `${printValue(mapping.input)} AS ${printValue(mapping.output)}`
          : printValue(mapping.output),
      )
      .join(", ");

  const printOrderingsList = (orderings: ClauseOrdering[]) =>
    orderings.map(order => `${printValue(order.expression)} ${order.direction}`).join(", ");

  const printYieldsList = (yieldsList: ProcedureResult[]) =>
    yieldsList.map(result => `${result.name} AS ${printValue(result.output)}`).join(", ");

  function printPattern(
    pattern: MatchClausePattern | CreateClausePattern,
    kind: "match" | "create",
  ) {
    const parts: string[] = [];
    let lastPartType: "node" | "relationship" | null = null;

    pattern.forEach(part => {
      const variable = part.variable ? printValue(part.variable) : "";
      const entityNames =
        part.entityType === "node"
          ? castArray(part.nodeLabels ?? [])
          : castArray(part.relationshipNames ?? []);
      const entityNameString =
        entityNames.length > 0 ? `:${entityNames.join(kind === "match" ? "|" : ":")}` : "";

      if (part.entityType === "node") {
        if (lastPartType === "node") {
          parts.push("--");
        }

        parts.push(`(${variable}${entityNameString})`);
        lastPartType = "node";
      } else if (part.entityType === "relationship") {
        if (lastPartType === "relationship" || lastPartType === null) {
          parts.push("()");
        }

        const inner = `[${variable}${entityNameString}]`;

        parts.push(
          part.direction === "->"
            ? `-${inner}->`
            : part.direction === "<-"
              ? `<-${inner}-`
              : `-${inner}-`,
        );
        lastPartType = "relationship";
      }
    });

    if (lastPartType === "relationship") {
      parts.push("()");
    }

    return parts.join("");
  }

  const addLine = (line: string, options?: { noIndent?: boolean }) => {
    lines.push(printIndent(options?.noIndent ? 0 : level) + line);
  };

  simplifiedClauses.forEach(clause => {
    switch (clause.type) {
      case "MATCH":
        addLine(
          `${clause.isOptional ? "OPTIONAL MATCH" : "MATCH"} ${clause.patterns
            .map(pattern => printPattern(pattern, "match"))
            .join(", ")}`,
        );
        break;
      case "IMPORT WITH":
        addLine(`WITH ${printValueList(clause.variables)}`);
        break;
      case "WITH":
        const withMappingsListStr = printMappingList(clause.mappings);
        addLine(
          `${clause.isDistinct ? "WITH DISTINCT" : "WITH"} ${
            clause.hasWildcard && withMappingsListStr.length > 0
              ? "*, "
              : clause.hasWildcard
                ? "*"
                : ""
          }${withMappingsListStr}`,
        );
        break;
      case "RETURN":
        addLine(
          `${clause.isDistinct ? "RETURN DISTINCT" : "RETURN"} ${printMappingList(
            clause.mappings,
          )}`,
        );
        break;
      case "ORDER BY":
        addLine(`ORDER BY ${printOrderingsList(clause.orderings)}`);
        break;
      case "WHERE":
        addLine(`WHERE ${printValueList(clause.predicates)}`);
        break;
      case "LIMIT":
        addLine(`LIMIT ${printValue(clause.value)}`);
        break;
      case "SKIP":
        addLine(`SKIP ${printValue(clause.value)}`);
        break;
      case "REMOVE":
        if ("propertyName" in clause) {
          addLine(`REMOVE ${printValue(clause.entity)}.${clause.propertyName}`);
        } else {
          addLine(`REMOVE ${printValue(clause.node)}:${clause.label}`);
        }
        break;
      case "SET":
        if ("propertyName" in clause) {
          addLine(
            `SET ${printValue(clause.entity)}.${clause.propertyName} = ${printValue(
              clause.value,
            )}`,
          );
        } else {
          addLine(`SET ${printValue(clause.node)}:${clause.label}`);
        }
        break;
      case "CREATE":
        addLine(
          `CREATE ${clause.patterns
            .map(pattern => printPattern(pattern, "create"))
            .join(", ")}`,
        );
        break;
      case "DELETE":
        addLine(
          `${clause.isDetach ? "DETACH DELETE" : "DELETE"} ${printValue(clause.entity)}`,
        );
        break;
      case "CALL PROCEDURE":
        addLine(
          `CALL ${clause.name}(${printValueList(clause.args)})${
            clause.yields.length > 0 ? ` YIELDS ${printYieldsList(clause.yields)}` : ""
          }`,
        );
        break;
      case "CALL SUBQUERY":
        addLine(`CALL {`);
        printClauses(clause.clauses, level + 1, paramRegistry).forEach(line => {
          addLine(line, { noIndent: true });
        });
        addLine(`}`);
        break;
      case "UNION SUBQUERY":
        addLine(`CALL {`);

        clause.subqueries.forEach((subqueryClauses, i) => {
          const isLast = clause.subqueries.length - 1 === i;
          printClauses(subqueryClauses, level + 1, paramRegistry).forEach(line => {
            addLine(line, { noIndent: true });
          });
          if (!isLast) {
            addLine("  UNION" + (clause.unionType === "all" ? " ALL" : ""));
          }
        });
        addLine(`}`);
        break;
      case "UNWIND":
        addLine(`UNWIND ${printValue(clause.list)} AS ${printValue(clause.output)}`);
        break;
    }
  });

  return lines;
}

export const printVariable = (variable: Variable) => `var${variable.index}`;
