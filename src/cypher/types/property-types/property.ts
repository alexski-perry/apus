import { Value } from "@core/value";

export class PropertyValue<TInput = any, TOutput = any> extends Value<TInput, TOutput> {
  private declare _isPropertyValue: true;
}
