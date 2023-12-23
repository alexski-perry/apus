// import { match } from "./$matchNode";
// import { QueryData } from "@core/query-data";
// import { UntypedPathBuilder } from "../pattern/untyped-path-builder";
// import { FRIENDS_WITH, Person } from "../../../test-helpers/schema";
// import { QueryTest } from "../../../test-helpers/query";
// import { GraphNode, GraphNodeImpl } from "../cypher/types/graph-node";
// import { GraphRelationshipImpl } from "../cypher/types/graph-relationship";
// import { Int } from "../types";
//
// import { PropertyValue } from "@core/value";
//
// describe("match()", () => {
//   describe("Empty input", () => {
//     let input: QueryData;
//
//     beforeAll(() => {
//       input = undefined;
//     });
//
//     it("A node pattern matched with '$' is output correctly", () => {
//       const query = match(() => UntypedPathBuilder.node(Person, "$"));
//
//       const { queryLines, output } = QueryTest.build(query, input);
//       expect(queryLines).toEqual(["MATCH (var0:Person)"]);
//       expect(output).toBeInstanceOf(GraphNodeImpl);
//     });
//
//     it("A node pattern matched with a name is output correctly", () => {
//       const query = match(() => UntypedPathBuilder.node(Person, "person"));
//
//       const { queryLines, output } = QueryTest.build(query, input);
//       expect(queryLines).toEqual(["MATCH (var0:Person)"]);
//       expect(output).toEqual({ person: expect.any(GraphNodeImpl) });
//     });
//
//     it("A path pattern with one part matched with a '$' is output correctly", () => {
//       const query = match(() =>
//         UntypedPathBuilder.path(
//           UntypedPathBuilder.node(Person),
//           UntypedPathBuilder.rel(FRIENDS_WITH, "->"),
//           UntypedPathBuilder.node(Person, "$"),
//         ),
//       );
//
//       const { queryLines, output } = QueryTest.build(query, input);
//       expect(queryLines).toEqual(["MATCH (:Person)-[:FRIENDS_WITH]->(var0:Person)"]);
//       expect(output).toBeInstanceOf(GraphNodeImpl);
//     });
//
//     it("A path pattern with multiple parts matched with a '$' has the last part output anonymously", () => {
//       const query = match(() =>
//         UntypedPathBuilder.path(
//           UntypedPathBuilder.node(Person),
//           UntypedPathBuilder.rel(FRIENDS_WITH, "<-", "$"),
//           UntypedPathBuilder.node(Person, "$"),
//         ),
//       );
//
//       const { queryLines, output } = QueryTest.build(query, input);
//       expect(queryLines).toEqual(["MATCH (:Person)<-[var0:FRIENDS_WITH]-(var1:Person)"]);
//       expect(output).toBeInstanceOf(GraphNodeImpl);
//     });
//
//     it("A path pattern with multiple named parts is output correctly", () => {
//       const query = match(() =>
//         UntypedPathBuilder.path(
//           UntypedPathBuilder.node(Person, "friendA"),
//           UntypedPathBuilder.rel(FRIENDS_WITH, "<-", "rel"),
//           UntypedPathBuilder.node(Person, "friendB"),
//         ),
//       );
//
//       const { queryLines, output } = QueryTest.build(query, input);
//       expect(queryLines).toEqual(["MATCH (var0:Person)<-[var1:FRIENDS_WITH]-(var2:Person)"]);
//       expect(output).toEqual({
//         friendA: expect.any(GraphNodeImpl),
//         rel: expect.any(GraphRelationshipImpl),
//         friendB: expect.any(GraphNodeImpl),
//       });
//     });
//   });
//
//   describe("Anonymous input", () => {
//     let input: GraphNode<Person>;
//
//     beforeAll(() => {
//       input = GraphNodeImpl.createFromTemplate(Person)`input_person`;
//     });
//
//     it("A node pattern matched with '$' replaces the input", () => {
//       const query = match((_input: typeof input) => UntypedPathBuilder.node(Person, "$"));
//
//       const { queryLines, output } = QueryTest.build(query, input);
//       expect(queryLines).toEqual(["MATCH (var0:Person)"]);
//       expect(output).toBeInstanceOf(GraphNodeImpl);
//     });
//
//     it("A node pattern matched with a name replaces the input", () => {
//       const query = match((_input: typeof input) => UntypedPathBuilder.node(Person, "person"));
//
//       const { queryLines, output } = QueryTest.build(query, input);
//       expect(queryLines).toEqual(["MATCH (var0:Person)"]);
//       expect(output).toEqual({
//         person: expect.any(GraphNodeImpl),
//       });
//     });
//
//     it("A path pattern that uses the input and matched with named parts, replaces the input", () => {
//       const query = match((_input: typeof input) =>
//         UntypedPathBuilder.path(
//           UntypedPathBuilder.node(_input),
//           UntypedPathBuilder.rel(FRIENDS_WITH, "--", "rel"),
//           UntypedPathBuilder.node(Person, "friendB"),
//         ),
//       );
//
//       const { queryLines, output } = QueryTest.build(query, input);
//       expect(queryLines).toEqual(["MATCH (input_person)-[var0:FRIENDS_WITH]-(var1:Person)"]);
//       expect(output).toEqual({
//         friendB: expect.any(GraphNodeImpl),
//         rel: expect.any(GraphRelationshipImpl),
//       });
//     });
//   });
//
//   describe("Named input", () => {
//     let input: { person: GraphNode<Person>; someInt: Int };
//
//     beforeAll(() => {
//       input = {
//         person: GraphNodeImpl.createFromTemplate(Person)`input_person`,
//         someInt: PropertyValue.createFromTemplate(Int)`input`,
//       };
//     });
//
//     it("A node pattern matched with '$' replaces the input", () => {
//       const query = match((inp: typeof input) => UntypedPathBuilder.node(Person, "$"));
//
//       const { queryLines, output } = QueryTest.build(query, input);
//       expect(queryLines).toEqual(["MATCH (var0:Person)"]);
//       expect(output).toBeInstanceOf(GraphNodeImpl);
//     });
//
//     it("A path pattern matched with '$' replaces the input", () => {
//       const query = match((inp: typeof input) =>
//         UntypedPathBuilder.path(
//           UntypedPathBuilder.node(Person),
//           UntypedPathBuilder.node(Person, "$"),
//         ),
//       );
//
//       const { queryLines, output } = QueryTest.build(query, input);
//       expect(queryLines).toEqual(["MATCH (:Person)--(var0:Person)"]);
//       expect(output).toBeInstanceOf(GraphNodeImpl);
//     });
//
//     it("A node pattern matched with a unique name is merged with the input", () => {
//       const query = match((inp: typeof input) => UntypedPathBuilder.node(Person, "newPerson"));
//
//       const { queryLines, output } = QueryTest.build(query, input);
//       expect(queryLines).toEqual(["MATCH (var0:Person)"]);
//       expect(output).toEqual({
//         person: expect.any(GraphNodeImpl),
//         someInt: expect.any(Int),
//         newPerson: expect.any(GraphNodeImpl),
//       });
//     });
//
//     it("A node pattern matched with a duplicate name is merged (overridden) with the input", () => {
//       const query = match((inp: typeof input) => UntypedPathBuilder.node(Person, "someInt"));
//
//       const { queryLines, output } = QueryTest.build(query, input);
//       expect(queryLines).toEqual(["MATCH (var0:Person)"]);
//       expect(output).toEqual({
//         person: expect.any(GraphNodeImpl),
//         someInt: expect.any(GraphNodeImpl),
//       });
//     });
//
//     it("A path pattern matched with named parts (that uses the input) is merged (overridden when duplicate) with the input", () => {
//       const query = match((inp: typeof input) =>
//         UntypedPathBuilder.path(
//           UntypedPathBuilder.node(inp.person),
//           UntypedPathBuilder.rel(FRIENDS_WITH, "->", "rel"),
//           UntypedPathBuilder.node(Person, "person"),
//         ),
//       );
//
//       const { queryLines, output } = QueryTest.build(query, input);
//       expect(queryLines).toEqual(["MATCH (input_person)-[var0:FRIENDS_WITH]->(var1:Person)"]);
//       expect(output).toEqual({
//         person: expect.any(GraphNodeImpl),
//         rel: expect.any(GraphRelationshipImpl),
//         someInt: expect.any(Int),
//       });
//     });
//   });
// });
