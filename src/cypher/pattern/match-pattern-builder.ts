import { Id } from "@utils/Id";
import {
  DataMergeString,
  ExtractIdentifier,
  Identifier,
  IGNORED,
  Ignored,
  ROOT_MERGE,
  RootMerge,
} from "@core/data-merge-string";
import { StringKeys } from "@utils/StringKeys";
import { QueryData } from "@core/query-data";
import { Node, NodeValue } from "@cypher/types/structural/node";
import { Relationship, RelationshipValue } from "@cypher/types/structural/relationship";
import {
  MatchPattern,
  MatchPatternData,
  MatchPatternDirection,
  MatchPatternNodeValue,
} from "@core/pattern/match-pattern";
import {
  isPatternVariableDeclaration,
  patternVariableDeclaration,
  PatternVariableDeclaration,
} from "@core/pattern/pattern-variable-declaration";
import { PatternOutputShape } from "@core/pattern/pattern-output-shape";
import { Value } from "@core/value";
import {
  AbstractNodeDefinitionClass,
  AbstractRelationshipDefinitionClass,
  NodeDefinitionClass,
  NodeUnionDefinitionClass,
  RelationshipDefinitionClass,
  RelationshipUnionDefinitionClass,
} from "@schema/definition";
import {
  DefinitionFromClass,
  getNodeLabelsForMatching,
  getConcreteRelationshipNames,
} from "@schema/utils";

// todo implement named paths
export const pattern = (): MatchPatternBuilder<void, {}, {}> =>
  new MatchPatternBuilder({
    parts: [],
    outputShape: undefined,
    nodeReferences: {},
    relationshipReferences: {},
  });

export class MatchPatternBuilder<
  TData extends QueryData,
  TNodeRefs extends Record<string, Node>,
  TRelRefs extends Record<string, Relationship>,
> extends MatchPattern<TData, "many"> {
  constructor(
    private patternData: Omit<MatchPatternData, "cardinality"> & {
      nodeReferences: ReferenceMap;
      relationshipReferences: ReferenceMap;
    },
  ) {
    super({
      parts: patternData.parts,
      outputShape: patternData.outputShape,
      cardinality: "many",
    });
  }

  public newNode<
    TNode extends
      | string
      | NodeDefinitionClass
      | AbstractNodeDefinitionClass
      | NodeUnionDefinitionClass,
    TReference extends DataMergeString | PrivateReference = Ignored,
  >(
    node: TNode,
    reference: TReference = IGNORED as TReference,
  ): MatchPatternBuilder<
    MergePatternOutput<TData, TReference, Node<DefinitionFromClass<TNode>>>,
    MergeNodeRefs<TNodeRefs, TReference, Node<DefinitionFromClass<TNode>>>,
    TRelRefs
  > {
    if (reference !== IGNORED) {
      const variableDeclaration = patternVariableDeclaration(NodeValue.makeType(node));

      return new MatchPatternBuilder({
        parts: [
          ...this.patternData.parts,
          {
            entityType: "node",
            value: variableDeclaration,
            nodeLabels: getNodeLabelsForMatching(node),
          },
        ],
        outputShape: !isPrivateReference(reference)
          ? addToOutputShape(this.patternData.outputShape, reference, variableDeclaration)
          : { ...this.patternData.outputShape },
        nodeReferences: addReference(
          this.patternData.nodeReferences,
          reference,
          variableDeclaration,
        ),
        relationshipReferences: { ...this.patternData.relationshipReferences },
      });
    } else {
      return new MatchPatternBuilder({
        parts: [
          ...this.patternData.parts,
          {
            entityType: "node",
            value: null,
            nodeLabels: getNodeLabelsForMatching(node),
          },
        ],
        outputShape: { ...this.patternData.outputShape },
        nodeReferences: { ...this.patternData.nodeReferences },
        relationshipReferences: { ...this.patternData.relationshipReferences },
      });
    }
  }

  public newRelationship<
    TRelationship extends
      | string
      | RelationshipDefinitionClass
      | AbstractRelationshipDefinitionClass
      | RelationshipUnionDefinitionClass,
    TReference extends DataMergeString | PrivateReference = Ignored,
  >(
    relationship: TRelationship,
    direction: MatchPatternDirection,
    reference: TReference = IGNORED as TReference,
  ): MatchPatternBuilder<
    MergePatternOutput<TData, TReference, Relationship<DefinitionFromClass<TRelationship>>>,
    TNodeRefs,
    MergeRelRefs<TRelRefs, TReference, Relationship<DefinitionFromClass<TRelationship>>>
  > {
    if (reference !== IGNORED) {
      const variableDeclaration: PatternVariableDeclaration = {
        _kind: "variable-declaration",
        type: RelationshipValue.makeType(relationship),
      };

      return new MatchPatternBuilder({
        parts: [
          ...this.patternData.parts,
          {
            entityType: "relationship",
            direction,
            value: variableDeclaration,
            relationshipNames: getConcreteRelationshipNames(relationship),
          },
        ],
        outputShape: !isPrivateReference(reference)
          ? addToOutputShape(this.patternData.outputShape, reference, variableDeclaration)
          : { ...this.patternData.outputShape },
        nodeReferences: { ...this.patternData.nodeReferences },
        relationshipReferences: addReference(
          this.patternData.nodeReferences,
          reference,
          variableDeclaration,
        ),
      });
    } else {
      return new MatchPatternBuilder({
        parts: [
          ...this.patternData.parts,
          {
            entityType: "relationship",
            direction,
            value: null,
            relationshipNames: getConcreteRelationshipNames(relationship),
          },
        ],
        outputShape: { ...this.patternData.outputShape },
        nodeReferences: { ...this.patternData.nodeReferences },
        relationshipReferences: { ...this.patternData.relationshipReferences },
      });
    }
  }

  public node(
    nodeRef: StringKeys<TNodeRefs> | MatchPatternNodeValue,
  ): MatchPatternBuilder<TData, TNodeRefs, TRelRefs> {
    if (nodeRef instanceof Value) {
      return new MatchPatternBuilder({
        parts: [
          ...this.patternData.parts,
          {
            entityType: "node",
            value: nodeRef,
            nodeLabels: [],
          },
        ],
        outputShape: { ...this.patternData.outputShape },
        nodeReferences: { ...this.patternData.nodeReferences },
        relationshipReferences: { ...this.patternData.relationshipReferences },
      });
    } else {
      const value = this.patternData.nodeReferences[nodeRef];
      if (!value) throw new Error(`no such node reference: '${nodeRef}'`);

      return new MatchPatternBuilder({
        parts: [
          ...this.patternData.parts,
          {
            entityType: "node",
            value,
            nodeLabels: [],
          },
        ],
        outputShape: { ...this.patternData.outputShape },
        nodeReferences: { ...this.patternData.nodeReferences },
        relationshipReferences: { ...this.patternData.relationshipReferences },
      });
    }
  }

  public relationship(
    relRef: StringKeys<TRelRefs> | RelationshipValue,
    direction: MatchPatternDirection,
  ): MatchPatternBuilder<TData, TNodeRefs, TRelRefs> {
    if (relRef instanceof RelationshipValue) {
      return new MatchPatternBuilder({
        parts: [
          ...this.patternData.parts,
          {
            entityType: "relationship",
            direction,
            value: relRef,
            relationshipNames: [],
          },
        ],
        outputShape: { ...this.patternData.outputShape },
        nodeReferences: { ...this.patternData.nodeReferences },
        relationshipReferences: { ...this.patternData.relationshipReferences },
      });
    } else {
      const value = this.patternData.relationshipReferences[relRef];
      if (!value) throw new Error(`no such relationship reference: '${relRef}'`);

      return new MatchPatternBuilder({
        parts: [
          ...this.patternData.parts,
          {
            entityType: "relationship",
            direction,
            value,
            relationshipNames: [],
          },
        ],
        outputShape: { ...this.patternData.outputShape },
        nodeReferences: { ...this.patternData.nodeReferences },
        relationshipReferences: { ...this.patternData.relationshipReferences },
      });
    }
  }
}

/*
  INTERNAL
 */

const addToOutputShape = (
  prevShape: PatternOutputShape,
  reference: Identifier | RootMerge,
  variableDeclaration: PatternVariableDeclaration,
): PatternOutputShape => {
  if (
    prevShape instanceof Value ||
    isPatternVariableDeclaration(prevShape) ||
    (prevShape && reference === ROOT_MERGE)
  ) {
    throw new Error("an '@' reference must be the only reference in a pattern");
  }

  if (prevShape && reference.substring(1) in prevShape) {
    throw new Error(`duplicate reference '${reference}' in pattern`);
  }

  if (reference === "@") {
    return variableDeclaration;
  } else {
    return {
      ...(prevShape ?? {}),
      [reference.substring(1)]: variableDeclaration,
    };
  }
};

type ReferenceMap = Record<string, PatternVariableDeclaration>;

const addReference = (
  prev: ReferenceMap,
  reference: Identifier | RootMerge | PrivateReference,
  value: PatternVariableDeclaration,
): ReferenceMap => {
  if (reference in prev) throw new Error(`duplicate pattern reference: '${reference}'`);
  return {
    ...prev,
    [reference]: value,
  };
};

type MergePatternOutput<
  TPreviousOutput extends QueryData,
  TReference extends DataMergeString | PrivateReference,
  TValue extends Value,
> = TReference extends Identifier
  ? Id<
      {
        [_ in ExtractIdentifier<TReference>]: TValue;
      } & Omit<TPreviousOutput, ExtractIdentifier<TReference>>
    >
  : TReference extends RootMerge
    ? TValue
    : TPreviousOutput;

type MergeNodeRefs<
  TNodeRefs extends Record<string, Node>,
  TReference extends DataMergeString | PrivateReference,
  TValue extends Node,
> = TReference extends Ignored
  ? TNodeRefs
  : {
      [_ in TReference]: TValue;
    } & Omit<TNodeRefs, string>;

type MergeRelRefs<
  TRelRefs extends Record<string, RelationshipValue>,
  TReference extends DataMergeString | PrivateReference,
  TValue extends RelationshipValue,
> = TReference extends Ignored
  ? TRelRefs
  : {
      [_ in TReference]: TValue;
    } & Omit<TRelRefs, TReference>;

type PrivateReference = `#${string}`;

const isPrivateReference = (val: string): val is PrivateReference => val.startsWith("#");
