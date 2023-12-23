import { PropertyValue } from "./property";

export abstract class TemporalValue<TInput = any, TOutput = any> extends PropertyValue<
  TInput,
  TOutput
> {
  private declare _isTemporalValue: true;
}
