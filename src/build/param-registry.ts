import { Parameter } from "@core/value-info";
import { serializeValue } from "@core/type/type";

export class ParamRegistry {
  private paramCount: number = 1;
  private params: Record<string, any> = {}; // the actual param map included in request
  private paramValueCache: Map<any, string> = new Map(); // cache of values, to limit number of params needed

  public registerAndPrint(param: Parameter): string {
    const cached = this.paramValueCache.get(param.value);
    if (cached) return "$" + cached;
    const newParam = `param${this.paramCount++}`;
    this.params[newParam] = serializeValue(param.value, param.type);
    this.paramValueCache.set(param.value, newParam);
    return "$" + newParam;
  }

  public getParams() {
    return this.params;
  }
}
