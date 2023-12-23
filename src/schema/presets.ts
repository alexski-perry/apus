import { uuid } from "cypher/expression";
import { id } from "./property-fns";

export class None {}

export class WithID {
  id = id({ generate: uuid() });
}
