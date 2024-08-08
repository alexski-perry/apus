const SUBTYPES_KEY = "__expected_subtypes";

/**
 * Utilities to help keep track of which definitions extend what, so that errors can be thrown if
 *  '$subtypes' fields are not complete. This ensures users don't miss out on full type safety.
 */

export function registerExpectedSubtype(supertype: Function, subtype: Function) {
  const subtypesList = getExpectedSubtypes(supertype);
  subtypesList.push(subtype);
  (supertype as any)[SUBTYPES_KEY] = subtypesList;
}

export function getExpectedSubtypes(supertype: Function): Function[] {
  if (Object.hasOwn(supertype, SUBTYPES_KEY)) {
    return (supertype as any)[SUBTYPES_KEY];
  } else {
    return [];
  }
}
