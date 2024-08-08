import { String } from "neo4j-querier/Types";
import { matchesRegex } from "@cypher/expression/function/string";

export const isSlug = (value: String) => matchesRegex(value, /slug/);
