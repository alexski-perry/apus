import { Query } from "@core/query";
import { NodeValue } from "@cypher/types";
import { $deleteNode } from "@cypher/stages";
import { Value } from "@core/value";
import { query } from "../query";
import { Cardinality } from "@core/cardinality";

export function deleteNode<T extends NodeValue>(value: T): Query<void, "one">;

export function deleteNode<TCard extends Cardinality>(
  query: Query<NodeValue, TCard>,
): Query<void, TCard>;

export function deleteNode(input: Value | Query<any, any>): Query<any, any> {
  const baseQuery = input instanceof Value ? query().pipe(() => input) : input;
  return baseQuery.pipe(row => $deleteNode(row));
}
