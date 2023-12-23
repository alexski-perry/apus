// has key and is not undefined
export type HasKey<T, K> = K extends keyof T ? (T[K] extends undefined ? false : true) : false;
