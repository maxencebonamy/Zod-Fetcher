export type MaybeFunction<A extends unknown[], R> = R | ((...args: A) => R)

export type UnaryFunction<T> = (props: T) => T
