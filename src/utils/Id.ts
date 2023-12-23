export type Id<T> = T extends Function ? T : { [K in keyof T]: T[K] };
