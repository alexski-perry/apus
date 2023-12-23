import {
  isObjectQueryData,
  isTupleQueryData,
  isValueQueryData,
  QueryData,
  Value,
} from "@core";
import { ConstructorOf } from "@utils/ConstructorOf";
import { Any } from "@cypher/types";
import { Map } from "@cypher/types/map";
import { Pair } from "@cypher/types/pair";
import { typeOf } from "@core/utils";
import { Triple } from "@cypher/types/triple";
import { ExpressionPrintFn } from "@core/value-data";

export const expression = <T extends Value>(type: ConstructorOf<T>) => {
  return (strings: TemplateStringsArray, ...inputs: (Value | string)[]) => {
    const { dependencies, printFn } = parseExpressionTemplate(strings, ...inputs);
    return Value.create(type, {
      kind: "expression",
      type,
      print: printFn,
      dependencies: [...dependencies],
    });
  };
};

export const expressionMultiline = <T extends Value>(
  type: ConstructorOf<T>,
  linesCallback: (
    line: (
      additionalIndent: number,
    ) => (strings: TemplateStringsArray, ...inputs: (Value | string)[]) => LineInfo,
  ) => Array<LineInfo>,
) => {
  const lineFn =
    (additionalIndent: number) =>
    (strings: TemplateStringsArray, ...inputs: (Value | string)[]): LineInfo => {
      const { printFn, dependencies } = parseExpressionTemplate(strings, ...inputs);

      return {
        additionalIndent,
        printFn,
        dependencies,
      };
    };

  const allLines = linesCallback(lineFn);
  const allDependencies = new Set<number>();

  allLines.forEach(line => {
    line.dependencies.forEach(dep => {
      allDependencies.add(dep);
    });
  });

  return Value.create(type, {
    kind: "expression",
    type,
    print: (level, printUtils) => {
      return allLines
        .map((line, i) => {
          const lineValue = line.printFn(level, printUtils);
          return i === 0
            ? lineValue
            : `${printUtils.printIndent(level + line.additionalIndent)}${lineValue}`;
        })
        .join("\n");
    },
    dependencies: [...allDependencies],
  });
};

export const expressionFromQueryData = (queryData: QueryData, additionalLevel = 0): Value => {
  if (!queryData) {
    return expression(Any)`null`;
  } else if (isValueQueryData(queryData)) {
    return queryData;
  } else if (isObjectQueryData(queryData)) {
    return expressionMultiline(Map.of({}), line => {
      const lines: Array<LineInfo> = [];
      lines.push(line(additionalLevel)`{`);
      const entries = Object.entries(queryData);
      entries.forEach(([key, val], i) => {
        const isLast = i === entries.length - 1;
        lines.push(
          line(additionalLevel + 1)`${key}: ${expressionFromQueryData(
            val,
            additionalLevel + 1,
          )}${!isLast ? "," : ""}`,
        );
      });
      lines.push(line(additionalLevel)`}`);
      return lines;
    });
  } else if (isTupleQueryData(queryData)) {
    if (queryData.length === 2) {
      return expression(
        Pair.of(typeOf(queryData[0]), typeOf(queryData[1])),
      )`[${queryData[0]}, ${queryData[1]}]`;
    }
    if (queryData.length === 3) {
      return expression(
        Triple.of(typeOf(queryData[0]), typeOf(queryData[1]), typeOf(queryData[2])),
      )`[${queryData[0]}, ${queryData[1]}, ${queryData[2]}]`;
    }
  }
  throw new Error("unexpected query data shape");
};

/*
  INTERNAL
 */

type LineInfo = {
  additionalIndent: number;
  printFn: ExpressionPrintFn;
  dependencies: Set<number>;
};

const parseExpressionTemplate = (
  strings: TemplateStringsArray,
  ...inputs: (Value | string)[]
): { printFn: ExpressionPrintFn; dependencies: Set<number> } => {
  const dependencies = new Set<number>();
  inputs.forEach(input => {
    if (input instanceof Value) {
      const valueData = Value.getValueData(input);
      if (valueData.kind === "variable") {
        dependencies.add(valueData.index);
      } else if (valueData.kind === "expression") {
        valueData.dependencies.forEach(varId => dependencies.add(varId));
      }
    }
  });

  return {
    printFn: (_, printUtils) => {
      const inputStrs = inputs.map(input =>
        typeof input === "string" ? input : printUtils.printValue(Value.getValueData(input)),
      );

      let str = "";
      strings.forEach((string, i) => {
        const input = inputStrs[i];
        if (!!input) {
          str += string + input;
        } else {
          str += string;
        }
      });

      return str;
    },
    dependencies,
  };
};
