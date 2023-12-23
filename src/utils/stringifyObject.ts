/**
 * Converts an object to a single-line string
 */
export const stringifyObject = (
  obj: Record<string, any>,
  isLeaf: (val: any) => boolean,
  stringifyLeaf: (val: any) => string,
): string => {
  if (isLeaf(obj)) return stringifyLeaf(obj);

  const objElements: string[] = [];

  Object.entries(obj).forEach(([key, val]) => {
    const valueString = isLeaf(val)
      ? stringifyLeaf(val)
      : stringifyObject(val, isLeaf, stringifyLeaf);
    objElements.push(`${key}: ${valueString}`);
  });

  return `{ ${objElements.join(", ")} }`;
};
