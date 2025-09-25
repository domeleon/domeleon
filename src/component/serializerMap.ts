type Ctor<T> = abstract new (...args: any[]) => T

type SerializerCtor<T> =
  T extends string  ? StringConstructor  :
  T extends number  ? NumberConstructor  :
  T extends boolean ? BooleanConstructor :
  T extends Date    ? DateConstructor    :
  T extends object  ? Ctor<T>            :
  never

export type SerializerMap<T> = {
  [K in keyof T]?:
    T[K] extends (infer E)[]
      ? [SerializerCtor<E>] | null
      : SerializerCtor<NonNullable<T[K]>> | null
}