import { isValueInfo, Parameter, ValueInfo, Variable } from "@core/value-info";
import { deepMap } from "@utils/deepMap";
import { Any, Map, Null, nullConst, Pair, Triple } from "neo4j-querier";
import { Type } from "@core/type/type";
import { Value } from "@core/value";
import { DynamicExpressionLine, expression, expressionMultiline } from "@core/expression";

type VarOrParam = Variable | Parameter;

export type DataShape =
  | void
  | VarOrParam
  | {
      [key: string]: DataShape;
    }
  | Array<VarOrParam>;

function isObjectDataShape(shape: DataShape): shape is Record<string, DataShape> {
  return !!shape && !isValueInfo(shape) && !Array.isArray(shape);
}

function isTupleDataShape(shape: DataShape): shape is Array<VarOrParam> {
  return !!shape && !isValueInfo(shape) && Array.isArray(shape);
}

export function mapDataShape(dataShape: DataShape, mapF: (data: VarOrParam) => any): any {
  return deepMap(dataShape, isValueInfo, mapF);
}

export function allVariablesFromDataShape(dataShape: DataShape): Array<Variable> {
  const variables: Array<Variable> = [];
  mapDataShape(dataShape, variable => {
    if (variable.kind === "variable") {
      variables.push(variable);
    }
  });
  return variables;
}

export function mergeDataShape(input: DataShape, output: DataShape): DataShape {
  return isObjectDataShape(input) && isObjectDataShape(output)
    ? { ...input, ...output }
    : output === undefined
      ? input
      : output;
}

export function makeTypeFromDataShape(shape: DataShape): Type {
  if (!shape) {
    return Null;
  } else if (isValueInfo(shape)) {
    return shape.type;
  } else if (isObjectDataShape(shape)) {
    const mapStructure: Record<string, Type> = mapDataShape(shape, val => val.type);
    return Map.makeType(mapStructure);
  } else if (isTupleDataShape(shape)) {
    if (shape.length === 2) {
      return Pair.makeType(shape[0]!.type, shape[1]!.type);
    }
    if (shape.length === 3) {
      return Triple.makeType(shape[0]!.type, shape[1]!.type, shape[2]!.type);
    }
  }
  throw new Error("couldn't match data shape");
}

export function makeExpressionFromDataShape(shape: DataShape, additionalLevel = 0): ValueInfo {
  if (!shape) {
    return Value.getValueInfo(nullConst());
  } else if (isValueInfo(shape)) {
    return shape;
  } else if (isObjectDataShape(shape)) {
    const mapStructure: Record<string, Type> = mapDataShape(shape, val => val.type);
    const expression = expressionMultiline(Map.makeType(mapStructure), line => {
      const lines: Array<DynamicExpressionLine> = [];
      lines.push(line(additionalLevel)`{`);
      const entries = Object.entries(shape);
      entries.forEach(([key, val], i) => {
        const isLast = i === entries.length - 1;
        lines.push(
          line(additionalLevel + 1)`${key}: ${Value.create(
            Any,
            makeExpressionFromDataShape(val, additionalLevel + 1),
          )}${!isLast ? "," : ""}`,
        );
      });
      lines.push(line(additionalLevel)`}`);
      return lines;
    });

    return Value.getValueInfo(expression);
  } else if (isTupleDataShape(shape)) {
    if (shape.length === 2) {
      return Value.getValueInfo(
        expression(Pair.makeType(shape[0]!.type, shape[1]!.type))`[${Value.create(
          Any,
          shape[0]!,
        )}, ${Value.create(Any, shape[1]!)}]`,
      );
    }
    if (shape.length === 3) {
      return Value.getValueInfo(
        expression(
          Triple.makeType(shape[0]!.type, shape[1]!.type, shape[2]!.type),
        )`[${Value.create(Any, shape[0]!)}, ${Value.create(Any, shape[1]!)}, ${Value.create(
          Any,
          shape[2]!,
        )}]`,
      );
    }
  }
  throw new Error("couldn't match data shape");
}
