export type StringKeys<T extends object> = keyof T extends string ? keyof T : never;
