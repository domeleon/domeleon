export const isPrimitive = (v: unknown): v is (null | string | number | boolean | Date) =>
  v === null ||
  typeof v === 'string' ||
  typeof v === 'number' ||
  typeof v === 'boolean' ||
  v instanceof Date

export const clamp = (raw: unknown, maxLength: number) => {
  const s = String(raw)
  const needsClamp = typeof raw === 'string' && s.length > maxLength
  return needsClamp ? `${s.slice(0, maxLength - 1)}…` : s
}
  