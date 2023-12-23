import { Variable } from "@core/value-data";
import { Type } from "@core/type";

export class VarBag {
  private varCount: number = 0;

  public nextVariable(type: Type): Variable {
    return {
      kind: "variable",
      type,
      index: this.varCount++,
    };
  }
}
