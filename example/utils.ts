import { String } from "neo4j-querier/types";
import { matchesRegex } from "cypher/expression";

export const isSlug = (value: String) => matchesRegex(value, /slug/);
