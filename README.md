
Apus is a 100% fully type-safe library for writing declarative, composable Neo4j Cypher queries, based on a schema you define using the library's elegant class-based API.

This library was designed to be the gold standard in developer experience for writing Neo4j Cypher queries in Typescript.

Some of the highlight features:
- Rich API for writing succinct, declarative, and composable queries
- 100% type-safety
- Efficient by default — uses latest Neo4j features, and tries to prevent unintentional 'cardinality blowup'
- Powerful schema definitions that are enforced in all queries
- Ability to define and handle polymorphic types, maintaining full type safety

# Usage

### Basic Example 

First we need to define the shape of our graph data. The example below demonstrates how to define nodes, relationships, properties, and relations between nodes.

```ts
import { $, node, relationship, string, date, int, relation_one, relation_many } from "apus/schema";

class Movie {
  $ = node({ label: "Movie" });
  
  name         = string();
  release_date = date();

  actors   = relation_many(ACTED_IN, "<-", Person);
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

Now we can start writing queries. All queries are defined using the `query` function, which allows you build a 'pipeline' of query operations. The input of each stage  function automatically keeps track of the outpu  Here are our a few examples.

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
