const selectorSpacePrefix  = /\[&\s+/
const selectorSpaceInfix   = /\s+(?=[^\]]*\]:)/g
export const bracketVariantRegex  = /\[[^\]]+\]:\S+/g   // Bracket-variant token pattern, e.g. "[& h1]:mt-2" or "[lg:hover]:text-red"

export const normalizeUtilityClass = (token: string) => {
  if (!token.startsWith('[& ')) return token.trim()
  return token
    .trim()
    .replace(selectorSpacePrefix, '[&_')
    .replace(selectorSpaceInfix, '_')
}

export const normalizeUtilityString = (value: string) =>
  value.replace(bracketVariantRegex, m => normalizeUtilityClass(m))