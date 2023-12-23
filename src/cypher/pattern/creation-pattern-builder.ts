import { getNodeType, MakeNodeValue, MakeRelationshipValue, NodeValue } from "@cypher/types";
import { Id } from "@utils/Id";
import {
  CreationPattern,
  CreationPatternData,
  CreationPatternDirection,
  IGNORED,
  isPatternVariableDeclaration,
  PatternOutputShape,
  PatternVariableDeclaration,
  QueryData,
  ROOT_MERGE,
  Value,
} from "@core";
import {
  DataMergeString,
  ExtractIdentifier,
  Identifier,
  Ignored,
  RootMerge,
} from "@core/data-merge-string";
import { Definition, NodeLikeOrUnionDefinition } from "@schema/definition";
import { ConstructorOf } from "@utils/ConstructorOf";
import { getNodeLabels, getRelationshipName } from "@schema/models";
import { getRelationshipType } from "@cypher/types/utils";
import { StringKeys } from "@utils/StringKeys";

export const creationPattern = (): CreationPatternBuilder<void, {}> =>
  new CreationPatternBuilder({
    parts: [],
    outputShape: undefined,
    nodeReferences: {},
  });

export class CreationPatternBuilder<
  TData extends QueryData,
  TNodeRefs extends Record<string, NodeValue>,
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
    TNode extends string | ConstructorOf<NodeLikeOrUnionDefinition>,
    TReference extends DataMergeString | PrivateReference = Ignored,
  >(
    node: TNode,
    reference: TReference = IGNORED as TReference,
  ): CreationPatternBuilder<
    MergePatternOutput<TData, TReference, MakeNodeValue<TNode>>,
    MergeNodeRefs<TNodeRefs, TReference, MakeNodeValue<TNode>>
  > {
    if (reference !== IGNORED) {
      const variableDeclaration: PatternVariableDeclaration = {
        _kind: "variable-declaration",
        type: getNodeType(node),
      };

      return new CreationPatternBuilder({
        parts: [
          ...this.patternData.parts,
          {
            entityType: "node",
            value: variableDeclaration,
            nodeLabels: getNodeLabels(node),
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
            nodeLabels: getNodeLabels(node),
          },
        ],
        outputShape: { ...this.patternData.outputShape },
        nodeReferences: { ...this.patternData.nodeReferences },
      });
    }
  }

  public newRelationship<
    TRelationship extends string | ConstructorOf<Definition<"relationship">>,
    TReference extends DataMergeString | PrivateReference = Ignored,
  >(
    relationship: TRelationship,
    direction: CreationPatternDirection,
    reference: TReference = IGNORED as TReference,
  ): CreationPatternBuilder<
    MergePatternOutput<TData, TReference, MakeRelationshipValue<TRelationship>>,
    TNodeRefs
  > {
    if (reference !== IGNORED) {
      const variableDeclaration: PatternVariableDeclaration = {
        _kind: "variable-declaration",
        type: getRelationshipType(relationship),
      };

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
  TNodeRefs extends Record<string, NodeValue>,
  TReference extends DataMergeString | PrivateReference,
  TValue extends NodeValue,
> = TReference extends Ignored
  ? TNodeRefs
  : {
      [_ in TReference]: TValue;
    } & Omit<TNodeRefs, string>;

type PrivateReference = `#${string}`;

const isPrivateReference = (val: string): val is PrivateReference => val.startsWith("#");
