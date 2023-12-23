import { isValueData, Parameter, Variable } from "@core/value-data";
import { deepMap } from "@utils/deepMap";

type VarOrParam = Variable | Parameter;

export type DataShape =
  | void
  | VarOrParam
  | {
      [key: string]: DataShape;
    }
  | Array<VarOrParam>;

const isObjectDataShape = (shape: DataShape): shape is Record<string, DataShape> =>
  !!shape && !isValueData(shape) && !Array.isArray(shape);

export const mapDataShape = (dataShape: DataShape, mapF: (data: VarOrParam) => any): any =>
  deepMap(dataShape, isValueData, mapF);

export const allVariablesFromDataShape = (dataShape: DataShape): Array<Variable> => {
  const variables: Array<Variable> = [];
  mapDataShape(dataShape, variable => {
    if (variable.kind === "variable") {
      variables.push(variable);
    }
  });
  return variables;
};

export const mergeDataShape = (input: DataShape, output: DataShape): DataShape =>
  isObjectDataShape(input) && isObjectDataShape(output)
    ? { ...input, ...output }
    : output === undefined
    ? input
    : output;
