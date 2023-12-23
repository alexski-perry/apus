import { ClauseList } from "@core/clause-list";
import { Cardinality, StageCardinalityBehaviour, StageDataBehaviour } from "@core";
import { DataShape, mapDataShape, mergeDataShape } from "@core/data-shape";
import { VarBag } from "neo4j-querier/build/var-bag";
import { Clause } from "@core/clause";

export class QueryBuildState {
  /**
   * Stores all clauses that have been added so far in the current subquery (or root query)
   */
  public clauseList: ClauseList;

  /**
   * Stores all variables currently in scope
   */
  public variablesInScope: Set<number>;

  /**
   * The shape of the data that is currently being passed through the query
   */
  public dataShape: DataShape;

  /**
   * The current cardinality of the query
   */
  public cardinality: Cardinality;

  /**
   * A reference to the VarBag
   */
  public varBag: VarBag;

  constructor(args: {
    clauseList: ClauseList;
    variablesInScope: Set<number>;
    dataShape: DataShape;
    cardinality: Cardinality;
    varBag: VarBag;
  }) {
    this.clauseList = args.clauseList;
    this.variablesInScope = args.variablesInScope;
    this.dataShape = args.dataShape;
    this.cardinality = args.cardinality;
    this.varBag = args.varBag;
  }

  /**
    Used to create a QueryBuildState at the start of a subquery (or the root query)
   */
  static initial(varBag: VarBag) {
    return new QueryBuildState({
      varBag,
      cardinality: "one",
      clauseList: ClauseList.empty(),
      variablesInScope: new Set(),
      dataShape: undefined,
    });
  }

  /**
   Used to create a QueryBuildState at the start of a subquery (or the root query)
   */
  static update(
    previous: QueryBuildState,
    args: {
      dataBehaviour: StageDataBehaviour;
      cardinalityBehaviour: StageCardinalityBehaviour;
      clauses: Clause[];
      dataShape: DataShape;
    },
  ): QueryBuildState {
    const { dataBehaviour, cardinalityBehaviour, clauses, dataShape } = args;

    const newDataShape =
      dataBehaviour === "overwrite"
        ? dataShape
        : mergeDataShape(previous.dataShape, dataShape);

    const newVariablesInScope = new Set<number>();
    mapDataShape(newDataShape, value => {
      if (value.kind === "variable") {
        newVariablesInScope.add(value.index);
      }
    });

    const newCardinality = {
      same: previous.cardinality,
      optional: {
        one: "none-or-one" as const,
        "none-or-one": "none-or-one" as const,
        many: "many" as const,
      }[previous.cardinality],
      "force-one": "one" as const,
      "force-none-or-one": "none-or-one" as const,
      "force-many": "many" as const,
    }[cardinalityBehaviour];

    return new QueryBuildState({
      varBag: previous.varBag,
      clauseList: ClauseList.update(previous.clauseList, clauses),
      dataShape: newDataShape,
      variablesInScope: newVariablesInScope,
      cardinality: newCardinality,
    });
  }
}
