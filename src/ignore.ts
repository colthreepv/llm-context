export function matchesPattern(path: string, pattern: string): boolean {
  const regex = new RegExp(
    `^${pattern.replace(/\*/g, '.*').replace(/\?/g, '.')}$`,
  )
  return regex.test(path)
}
