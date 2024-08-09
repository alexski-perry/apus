import { ConstructorOf } from "@utils/ConstructorOf";
import { Map } from "@cypher/types/map";
import { Pair } from "@cypher/types/pair";
import { Triple } from "@cypher/types/triple";
import { ExpressionPrintFn } from "@core/value-info";
import {Type, typeOf} from "@core/type/type";
import { Value } from "@core/value";
import {isQueryDataMap, isTupleQueryData, mapQueryData, QueryData} from "@core/query-data";
import { Any } from "@cypher/types/any";

export const expression = <T extends Value>(type: ConstructorOf<T>) => {
  return (strings: TemplateStringsArray, ...inputs: (Value | string)[]) => {
    const { dependencies, printFn } = parseExpressionTemplate(strings, ...inputs);
    return Value.create(
      type,
      {
        kind: "expression",
        type,
        print: printFn,
      },
      dependencies,
    );
  };
};

export interface DynamicExpressionPart {
  printFn: ExpressionPrintFn;
  dependencies: Set<Value>;
}

export const expressionDynamic = <T extends Value>(
  type: ConstructorOf<T>,
  callback: (
    expr: (
      strings: TemplateStringsArray,
      ...inputs: (Value | string)[]
    ) => DynamicExpressionPart,
  ) => Array<DynamicExpressionPart>,
) => {
  const exprFn = (
    strings: TemplateStringsArray,
    ...inputs: (Value | string)[]
  ): DynamicExpressionPart => {
    const { printFn, dependencies } = parseExpressionTemplate(strings, ...inputs);

    return {
      printFn,
      dependencies,
    };
  };

  const allParts = callback(exprFn);
  const allDependencies = new Set<Value>();

  allParts.forEach(part => {
    part.dependencies.forEach(dep => {
      allDependencies.add(dep);
    });
  });

  return Value.create(
    type,
    {
      kind: "expression",
      type,
      print: (level, printUtils) =>
        allParts.map(part => part.printFn(level, printUtils)).join(""),
    },
    allDependencies,
  );
};

export interface DynamicExpressionLine extends DynamicExpressionPart {
  additionalIndent: number;
}

export const expressionMultiline = <T extends Value>(
  type: ConstructorOf<T>,
  linesCallback: (
    line: (
      additionalIndent: number,
    ) => (
      strings: TemplateStringsArray,
      ...inputs: (Value | string)[]
    ) => DynamicExpressionLine,
  ) => Array<DynamicExpressionLine>,
) => {
  const lineFn =
    (additionalIndent: number) =>
    (strings: TemplateStringsArray, ...inputs: (Value | string)[]): DynamicExpressionLine => {
      const { printFn, dependencies } = parseExpressionTemplate(strings, ...inputs);

      return {
        additionalIndent,
        printFn,
        dependencies,
      };
    };

  const allLines = linesCallback(lineFn);
  const allDependencies = new Set<Value>();

  allLines.forEach(line => {
    line.dependencies.forEach(dep => {
      allDependencies.add(dep);
    });
  });

  return Value.create(
    type,
    {
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
    },
    allDependencies,
  );
};

export const expressionFromQueryData = (queryData: QueryData, additionalLevel = 0): Value => {
  if (!queryData) {
    return expression(Any)`null`;
  } else if (queryData instanceof Value) {
    return queryData;
  } else if (isQueryDataMap(queryData)) {
    const type: Record<string, Type> = mapQueryData(queryData, val => typeOf(val));

    return expressionMultiline(Map.makeType(type), line => {
      const lines: Array<DynamicExpressionLine> = [];
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
        Pair.makeType(typeOf(queryData[0]), typeOf(queryData[1])),
      )`[${queryData[0]}, ${queryData[1]}]`;
    }
    if (queryData.length === 3) {
      return expression(
        Triple.makeType(typeOf(queryData[0]), typeOf(queryData[1]), typeOf(queryData[2])),
      )`[${queryData[0]}, ${queryData[1]}, ${queryData[2]}]`;
    }
  }
  throw new Error("unexpected query data shape");
};

/*
  INTERNAL
 */

const parseExpressionTemplate = (
  strings: TemplateStringsArray,
  ...inputs: (Value | string)[]
): { printFn: ExpressionPrintFn; dependencies: Set<Value> } => {
  const dependencies = new Set<Value>();
  inputs.forEach(input => {
    if (input instanceof Value) {
      const valueData = Value.getValueInfo(input);
      if (valueData.kind === "variable") {
        dependencies.add(input);
      } else if (valueData.kind === "expression") {
        for (const dep of Value.getDependencies(input)) {
          dependencies.add(dep);
        }
      }
    }
  });

  return {
    printFn: (_, printUtils) => {
      const inputStrs = inputs.map(input =>
        typeof input === "string" ? input : printUtils.printValue(Value.getValueInfo(input)),
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
