export function castArray<T>(input: T | T[]): T[] {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  return [input];
}
