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
import {
  CreationPattern,
  CreationPatternData,
  CreationPatternDirection,
} from "@core/pattern/creation-pattern";
import {
  isPatternVariableDeclaration,
  patternVariableDeclaration,
  PatternVariableDeclaration,
} from "@core/pattern/pattern-variable-declaration";
import {
  DefinitionFromClass,
  getNodeLabelsForMatching,
  getRelationshipName,
} from "@schema/utils";
import { PatternOutputShape } from "@core/pattern/pattern-output-shape";
import { Value } from "@core/value";
import {
  AbstractNodeDefinitionClass,
  NodeDefinitionClass,
  NodeUnionDefinitionClass,
  RelationshipDefinitionClass,
} from "@schema/definition";
import { Relationship, RelationshipValue } from "@cypher/types/structural/relationship";

export const creationPattern = (): CreationPatternBuilder<void, {}> =>
  new CreationPatternBuilder({
    parts: [],
    outputShape: undefined,
    nodeReferences: {},
  });

export class CreationPatternBuilder<
  TData extends QueryData,
  TNodeRefs extends Record<string, Node>,
> extends CreationPattern<TData> {
  constructor(
    private patternData: CreationPatternData & {
      nodeReferences: ReferenceMap;
    },
  ) {
    super({
      parts: patternData.parts,
      outputShape: patternData.outputShape,
    });
  }

  public newNode<
    TDef extends
      | string
      | NodeDefinitionClass,
    TReference extends DataMergeString | PrivateReference = Ignored,
  >(
    node: TDef,
    reference: TReference = IGNORED as TReference,
  ): CreationPatternBuilder<
    MergePatternOutput<TData, TReference, Node<DefinitionFromClass<TDef>>>,
    MergeNodeRefs<TNodeRefs, TReference, Node<DefinitionFromClass<TDef>>>
  > {
    if (reference !== IGNORED) {
      const variableDeclaration = patternVariableDeclaration(NodeValue.makeType(node));

      return new CreationPatternBuilder({
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
      });
    } else {
      return new CreationPatternBuilder({
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
      });
    }
  }

  public newRelationship<
    TDef extends string | RelationshipDefinitionClass,
    TRef extends DataMergeString | PrivateReference = Ignored,
  >(
    relationship: TDef,
    direction: CreationPatternDirection,
    reference: TRef = IGNORED as TRef,
  ): CreationPatternBuilder<
    MergePatternOutput<TData, TRef, Relationship<DefinitionFromClass<TDef>>>,
    TNodeRefs
  > {
    if (reference !== IGNORED) {
      const variableDeclaration = patternVariableDeclaration(
        RelationshipValue.makeType(relationship),
      );

      return new CreationPatternBuilder({
        parts: [
          ...this.patternData.parts,
          {
            entityType: "relationship",
            direction,
            value: variableDeclaration,
            relationshipName: getRelationshipName(relationship),
          },
        ],
        outputShape: !isPrivateReference(reference)
          ? addToOutputShape(this.patternData.outputShape, reference, variableDeclaration)
          : { ...this.patternData.outputShape },
        nodeReferences: { ...this.patternData.nodeReferences },
      });
    } else {
      return new CreationPatternBuilder({
        parts: [
          ...this.patternData.parts,
          {
            entityType: "relationship",
            direction,
            value: null,
            relationshipName: getRelationshipName(relationship),
          },
        ],
        outputShape: { ...this.patternData.outputShape },
        nodeReferences: { ...this.patternData.nodeReferences },
      });
    }
  }

  public node(
    nodeRef: StringKeys<TNodeRefs> | NodeValue,
  ): CreationPatternBuilder<TData, TNodeRefs> {
    if (nodeRef instanceof NodeValue) {
      return new CreationPatternBuilder({
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
      });
    } else {
      const value = this.patternData.nodeReferences[nodeRef];
      if (!value) throw new Error(`no such node reference: '${nodeRef}'`);

      return new CreationPatternBuilder({
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
      });
    }
  }
}

/*
  INTERNAL
 */

// todo merge duplicate code below

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

type PrivateReference = `#${string}`;

const isPrivateReference = (val: string): val is PrivateReference => val.startsWith("#");
