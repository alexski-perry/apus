# @alexski-perry/apus

## 0.8.0

### Minor Changes

- ce0a288: Replace `data` with the better-typed `parameterize`. Rename previous function of same name to `makeParam`

## 0.7.0

### Minor Changes

- a1e006f: Add `toInt` function

### Patch Changes

- a1e006f: Fix serialization and related types

## 0.6.1

### Patch Changes

- 0636a9b: Export `data` function

## 0.6.0

### Minor Changes

- ef74265: Add `toID` function
- ef74265: Add `data` function for paramaterizing complex data

### Patch Changes

- ef74265: Fix serialization of Any
- ef74265: Add missing `$unwind` export

## 0.5.1

### Patch Changes

- 785ebe6: Fixed handling of nested map types

## 0.5.0

### Minor Changes

- 6fca80d: Add `$mapMaybe` and update `mapMaybe` to use it

### Patch Changes

- 6fca80d: Fix optionalMatchNode type
- 6fca80d: Fix typing of matchMaybe/$matchMaybe

## 0.4.0

### Minor Changes

- cbcb4c8: Stop outing Neo4j temporal types (prefer standard Date, or new 'time objects')
- cbcb4c8: Add `mapMaybe`
- cbcb4c8: Change cardinality of $where to be less forgiving (change to '<-many')
- cbcb4c8: Make `project` use `mapMaybe`
- cbcb4c8: Add nullConst function

### Patch Changes

- cbcb4c8: Fix typo in $optionalMatchNode
- cbcb4c8: Respect noReturn option in buildSubquery

## 0.3.0

### Minor Changes

- c13dde7: Add 'matchRelation', add 'optionalMatchRelation' and rewrite 'project'; all to work only with RelationPattern
- c13dde7: Rename $matchOptional to $matchNoneOrOne, and add $matchOneOrMore
- c13dde7: Add 'maybe' function for mapping optional values
- c13dde7: Refactor cardinality system, and add new cardinality 'one-or-more'

### Patch Changes

- c13dde7: Remove cardinality from MatchPattern
- c13dde7: Fixes to optionalMatch
- c13dde7: Remove leftover loggings (finally!)
- c13dde7: Fix dependency tracking for expressions

## 0.2.0

### Minor Changes

- e62ab6c: Add 'toDate' function
- e62ab6c: Allow 'collectAgg' to take plain object

## 0.1.1

### Patch Changes

- 55070af: Fix makeTransformer so it handles all cardinalities correctly
- ea16ae3: Fix query simplifier to not allow LIMIT/SKIP after WHERE

## 0.1.0

### Minor Changes

- 9e76dd2: Fix $first
- 27d750c: Fix expressionFromQueryData so it uses correct map type
- 27d750c: Fix GetQueryOutput to properly handle 'none-or-one' queries
- cf827b8: Add pick utility
- cf827b8: Add additional overrides to makeQueryRunner

### Patch Changes

- 628c752: Rename stages folder to operations

## 0.0.6

### Patch Changes

- 03aad14: Refactor dummy fields to be protected so declaration files emitted with required annotations

## 0.0.5

### Patch Changes

- 990bff9: cleanup exports

## 0.0.4

### Patch Changes

- 7b9a5d8: Update changesets config
- fe722b4: add file field to package.json

## 0.0.3

### Patch Changes

- 3929aff: minor

## 0.0.2

### Patch Changes

- 62f3474: adjust types
- 39edf56: silly fixes
- f7a9432: Initial setup
- 506fd73: Remove changelog
