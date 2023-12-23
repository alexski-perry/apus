import { Cardinality } from "@core";
import { QueryResult } from "neo4j-driver";
import { parseValue } from "@core/type";
import { DataShape, mapDataShape } from "@core/data-shape";
import { printVariable } from "neo4j-querier/build/print";

export const makeTransformer =
  (args: { outputShape: DataShape; cardinality: Cardinality }) =>
  (data: QueryResult): any => {
    const { outputShape, cardinality } = args;
    let outputAsArray: any[] = [];

    outputAsArray = data.records.map(record => {
      return mapDataShape(outputShape, val => {
        if (val.kind === "parameter") throw new Error("unexpected parameter");
        const varName = printVariable(val);
        const responseVal = record.get(varName);
        return parseValue(responseVal, val.type);
      });
    });

    return cardinality === "one" ? outputAsArray[0] : outputAsArray;
  };
