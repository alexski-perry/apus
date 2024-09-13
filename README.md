
# Apus

Apus is a 100% fully type-safe library for writing declarative, composable Neo4j Cypher queries, based on a schema you define using the library's elegant class-based API. The library was designed to be the gold standard in developer experience for writing Neo4j Cypher queries in Typescript.

Some of the highlight features:
- Rich API for writing succinct, declarative, and composable queries
- Full type-safety for all queries
- 100% coverage of Cypher query language: any query can be constructed (without escape hatches!)
- Encourages efficient queries: uses the latest Neo4j features, and attempts to prevent unintentional 'cardinality blowup'
- Powerful schema definitions, enforced in all queries
- Ability to define and handle polymorphic types, maintaining full type safety

## Documentation

Documentation is nearly complete, but not quite ready. Once it is, the first public beta will be released.

## Example Usage

### Basic Movie & Actors Database 

First we need to define the shape of our graph data, using the library's class-based schema definition API. The example below demonstrates how to define nodes, relationships, properties, and relations.

The requirement for a class to be a graph entity definition is the presence of a `$` field.

```ts
import { $, node, relationship, string, date, int, relation_one, relation_many } from "apus/schema";

class Movie {
  $ = node({ label: "Movie" });
  
  name         = string();
  release_date = date();

  actors  = relation_many(ACTED_IN, "<-", Person);
  reviews = relation_one(REVIEW_OF, "<-", Person);
}

class Person {
  $ = node({ label: "Person" });

  name = string();
  dob  = date();

  acted_in          = relation_many(ACTED_IN, "->", Movie);
  published_reviews = relation_many(REVIEWED, "->", Movie);
}

class ACTED_IN {
  $ = relationship({ name: "ACTED_IN" });
}

class BELONGS_TO_GENRE {
  $ = relationship({ name: "BELONGS_TO_GENRE" });
}

class REVIEW_OF {
  $ = relationship({ name: "REVIEWED" });

  rating = int();
}

```

Now we can start writing queries. All queries are defined using the `query` function, with which we can build a 'pipeline' of query operations. The output type of each stage is passed as the input type of the next stage.

The pipeline is also clever enough to keeps track of the cardinality throughout — either `one`, `none-or-one`, `one-or-more` and `many`. This allows the exact output type to be known.

Here are a few example queries:

**Find the names of all actors in a given movie, sorted alphabetically**

```ts
const actors_query = query(
  findAll(Movie),
  (movie) => $where(eq(movie.name, "Casablanca")), // filter
  (movie) => $mapMany(matchRelation(movie.actors)), // get actors -- we use $mapMany to signal that each input row can produce multiple output rows 
  (actor) => $sort([actor.name, "DESC"]),
  (actor) => actor.name // map to desired output shape —— we can strip away properties we don't need
); 
```

**Find all pairs of actors who have appeared in multiple movies**

```ts
const actors_query = query(
  () => $match(
    pattern()
      .node(Actor, ":a") // we introduce 'a' and 'b' as variable
      .relationship(ACTED_IN, "->")
      .node(Movie)
      .relationship(ACTED_IN, "<-")
      .node(Movie, ":b")
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

```ts
import { $, node, relationship, string, date, int, relation_one, relation_many } from "apus/schema";

class Movie {
  $ = node({ label: "Movie" });
  
  name         = string();
  release_date = date();  
  
  actors   = relation_many(ACTED_IN, "<-", Actor);
  reviews  = relation_one(REVIEW_OF, "<-", Person);
}

class Person {
  $ = node({ 
    label: "Person",
    passLabel: true, // Actor node will have both Person and Actor Labels
    subtypes: [Actor] // Allows strong typing of subtypes
  });

  name = string();
  dob  = date();
  
  published_reviews = relation_many(REVIEWED, "->", Movie);
}

class Actor extends $(Person) {
  $ = node({ label: "Actor" });
  
  // ... inherits everything from Person
  
  acted_in = relation_many(ACTED_IN, "->", Movie);
}

class ACTED_IN {
  $ = relationship({ name: "ACTED_IN" });
}

class BELONGS_TO_GENRE {
  $ = relationship({ name: "BELONGS_TO_GENRE" });
}

class REVIEW_OF {
  $ = relationship({ name: "REVIEWED" });

  rating = int();
}

```
