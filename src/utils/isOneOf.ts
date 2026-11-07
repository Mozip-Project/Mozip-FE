function isOneOf<TValue extends string>(
  values: readonly TValue[],
  value: unknown,
): value is TValue {
  return values.some((item) => item === value)
}

export { isOneOf }
