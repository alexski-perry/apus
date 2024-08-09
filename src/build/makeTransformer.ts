import { QueryCardinality } from "@core/query-cardinality";
import { QueryResult } from "neo4j-driver";
import { parseValue } from "@core/type/type";
import { DataShape, mapDataShape } from "@core/data-shape";
import { printVariable } from "neo4j-querier/build/print";
import { isParameter } from "@core/value-info";

export const makeTransformer =
  (args: { outputShape: DataShape; cardinality: QueryCardinality }) =>
  (data: QueryResult): any => {
    const { outputShape, cardinality } = args;
    let outputAsArray = data.records.map(record => {
      return mapDataShape(outputShape, val => {
        if (isParameter(val)) throw new Error("Unexpected parameter in output shape");
        const varName = printVariable(val);
        const responseVal = record.get(varName);
        return parseValue(responseVal, val.type);
      });
    });

    return cardinality === "one" ? outputAsArray[0] : outputAsArray;
  };
