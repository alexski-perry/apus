import { ConstructorOf } from "@utils/ConstructorOf";

type SubtypesList = Array<{ cons: ConstructorOf<any>; identifier: string }>;

const expectedSubtypesCache = new WeakMap<ConstructorOf<any>, SubtypesList>();

export const setExpectedSubtypes = (
  cons: ConstructorOf<any>,
  val: ConstructorOf<any>,
  identifier: string,
): void => {
  const item = { cons: val, identifier };
  if (expectedSubtypesCache.has(cons)) {
    getExpectedSubtypes(cons).push(item);
  } else {
    expectedSubtypesCache.set(cons, [item]);
  }
};

export const getExpectedSubtypes = (cons: ConstructorOf<any>): SubtypesList => {
  return expectedSubtypesCache.get(cons) ?? [];
};
