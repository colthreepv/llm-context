export function matchesPattern(path: string, pattern: string): boolean {
  const escaped = pattern.replace(/\./g, '\\.')
  const regexString = escaped.replace(/\*/g, '.*')

  const regex = new RegExp(regexString)
  return regex.test(path)
}
