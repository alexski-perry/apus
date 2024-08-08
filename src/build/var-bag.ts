import { Variable } from "@core/value-info";
import { Type } from "@core/type/type";

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
