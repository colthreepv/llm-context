export function matchesPattern(path: string, pattern: string): boolean {
  const regexString = pattern
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.')
  const regex = new RegExp(regexString)
  return regex.test(path)
}
