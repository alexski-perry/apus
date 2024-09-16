
# Apus

Apus is a 100% fully type-safe library for writing declarative, composable Neo4j Cypher queries, based on a schema you define using the library's elegant class-based API. The library was designed to be the gold standard in developer experience for writing Neo4j Cypher queries in Typescript.

Some of the highlight features include:
- Rich API for writing succinct, declarative, and composable queries
- Full type-safety for all queries
- 100% coverage of Cypher query language: any query can be constructed (without escape hatches!)
- Encourages efficient queries: uses the latest Neo4j features, and attempts to prevent unintentional 'cardinality blowup'
- Powerful schema definitions, enforced in all queries
- Ability to define and handle polymorphic types, maintaining full type safety

## Documentation

Documentation is nearly complete, but not quite ready! Once it is, the first public beta will be released.

## Example Usage

### Basic Movie & Actors Database 

First we must define the shape of our graph data, using the library's class-based schema definition API. The example below demonstrates how to define nodes, relationships, properties, and relations.

The definitions should be fairly self-explanatory. One thing to note is that, in order to be recognised as a 'graph entity definition class', you must provide a correctly defined `$` field.

```ts
import { $, node, relationship, string, date, relation_many } from "apus/schema";

class Movie {
  $ = node({ label: "Movie" });
  
  name         = string();
  release_date = date();

  actors = relation_many(ACTED_IN, "<-", Person);
}

class Person {
  $ = node({ label: "Person" });

  name = string();
  dob  = date();

  acted_in = relation_many(ACTED_IN, "->", Movie);
}

class ACTED_IN {
  $ = relationship({ name: "ACTED_IN" });
}

```

We can now start writing queries. These are constructed using the `query` function, which takes a variable number of 'stages', that we build into 'pipeline' of different operations. The output type of each stage is passed as the input type of the next stage. In general, the stages correspond closely to clauses in Cypher, but there are some important differences to be aware of once you get stuck into the library.

The pipeline is also clever enough to keeps track of the query cardinality throughout — either `one`, `none-or-one`, `one-or-more` and `many`. This allows the exact output type to be known.

Here are a few examples:

**Find the names of all actors in a given movie, sorted alphabetically**

```ts
import { query, findAll, $where, $mapAny, $orderBy, matchRelation, eq } from "apus";

const actors_query = query(
  findAll(Movie),
  (movie) => $where(eq(movie.name, "Casablanca")), // filter
  (movie) => $mapMany(matchRelation(movie.actors)), // get actors -- we use $mapMany to signal that each input row can produce multiple output rows 
  (actor) => $orderBy([actor.name, "DESC"]),
  (actor) => actor.name // map to desired output shape —— we can strip away properties we don't need
); 
```

**Find all pairs of actors who have appeared in multiple movies**

```ts
import { query, $match, $where, countAgg, neq, gt, pattern } from "apus";

const actor_pairs_query = query(
  () => $match(
    pattern()
      .node(Actor, ":a") // we introduce 'a' and 'b' as variables
      .relationship(ACTED_IN, "->")
      .node(Movie)
      .relationship(ACTED_IN, "<-")
      .node(Actor, ":b")
  ),
  ({ a, b }) => $where(neq(a, b)),
  ({ a, b }) => ({
    a, b, // pass on 'a' and 'b' to the next stage
    count: countAgg()
  }),
  ({ count }) => $where(gt(count, 1)),
  ({ a, b }) => [a.name, b.name] // map to desired output shape
); 
```

**Finding the oldest actor in every movie (using composition)**

```ts
import { query, $mapMany, $orderBy, $first, findAll, matchRelation } from "apus";

const getOldestActor = (movie: Movie) => query(
  movie, // must pass in as variable
  movie => $mapMany(matchRelation(movie.actors)),
  actor => $orderBy(actor.dob),
  ()    => $first()
)

const oldest_actors_query = query(
  findAll(Movie),
  (movie) => ({
    name: movie.name,
    oldestActor: query(
      getOldestActor(movie),
      actor => actor.name
    )
  })
); 
```

## Inheritance & Polymorphic Types

We will extend the previous example to include a polymorphic type `Production`. We will define this as an 'abstract node', which means that it won't exist in its own right within our database, but as either a `Movie` or `TVShow`.

Still, we can make use of inheritance, sharing common properties by defining them within `Production`, and then extending this class. Note that due to limitations in Typescript, we wrap the class we are extending in the special function `$` provided by the library.

```ts
import { $, node, abstract_node, relationship, string, int, relation_many } from "apus/schema";

class Production {
  $ = abstract_node({
    subtypes: [Movie, TVShow]    // we must provide these to allow strong typing of subtypes 
  });
  
  name = string();
  
  actors = relation_many(ACTED_IN, "<-", Actor);
}

class Movie extends $(Production) {
  $ = node({
    label: "Movie"
  });

  release_year = int();
}

class TVShow extends $(Production) {
  $ = node({
    label: "TVShow"
  });

  seasons = int();
}

class Person {
  $ = node({ label: "Person" });

  name = string();

  acted_in = relation_many(ACTED_IN, "->", Production); // note that we can use the polymporphic type here 
}

```

We can now query by all production nodes. Since `name` is a shared property, we are allowed to access it. Note however that the generated query actually searches for the union `Movie|TVShow`.

```ts
import { query, findAll } from "apus";

const all_production_names = query(
  findAll(Production),
  production => production.name
);
```

However, we can also perform a different subquery for each subtype:

```ts
import { query, findAll } from "apus";

const production_data_query = query(
  findAll(Production),
  production => mapBySubtype(production, {
    Movie: movie => ({
      kind: stringConst("Movie"),
      name: movie.name,
      year: movie.release_year
    }),
    TVShow: show => ({
      kind: stringConst("TVShow"),
      name: show.name,
      season_count: show.seasons
    })
  })
);

/*
The output type is:

Array<
   {
     kind: "Movie",
     name: string,
     year: number
   } |
   {
     kind: "TVShow",
     name: string,
     season_count: number
   }
>

 */

```