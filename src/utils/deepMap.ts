export const deepMap = (
  data: any,
  isLeaf: (value: any) => boolean,
  mapF: (data: any) => any,
): any => {
  if (isLeaf(data)) return mapF(data);
  if (Array.isArray(data)) {
    const output: any[] = [];
    data.forEach((val, i) => {
      output[i] = deepMap(val, isLeaf, mapF);
    });
    return output;
  }
  if (data instanceof Object) {
    const output: Record<string, any> = {};
    Object.entries(data).forEach(([key, value]) => {
      output[key] = deepMap(value, isLeaf, mapF);
    });
    return output;
  }
};
