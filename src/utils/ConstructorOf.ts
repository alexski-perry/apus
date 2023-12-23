export type ConstructorOf<T> = abstract new () => T;

export const constructorOf = <T extends object>(value: T): ConstructorOf<T> =>
  value.constructor as ConstructorOf<T>;
