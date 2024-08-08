import { node_template } from "@schema/entity-config";
import { uuid } from "@cypher/expression/function/uuid";
import { id } from "@schema/property";

export class BaseNode {
  $ = node_template();
  id = id({
    generate: uuid(),
  });
}
