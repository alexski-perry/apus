export const isPureObject = (input: any) =>
  null !== input &&
  typeof input === "object" &&
  Object.getPrototypeOf(input).isPrototypeOf(Object);
