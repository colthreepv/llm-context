import { Buffer } from 'node:buffer'
import { closeSync, openSync, readdirSync, readFileSync, readSync, statSync } from 'node:fs'
import { extname, join, relative } from 'node:path'
import { BINARY_CHECK_BUFFER_SIZE, DEFAULT_IGNORE_PATHS, MAX_JSON_ARRAY_ITEMS, MAX_JSON_ENTRIES } from './constants.js'
import { matchesPattern } from './ignore.js'

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3.622831)
}

export interface FileNode {
  name: string
  type: 'file' | 'directory'
  children?: FileNode[]
}

export function isJSONFile(filePath: string): boolean {
  return extname(filePath).toLowerCase() === '.json'
}

export function isBinaryFile(filePath: string): boolean {
  const fd = openSync(filePath, 'r')
  const buffer = Buffer.alloc(BINARY_CHECK_BUFFER_SIZE)

  try {
    const bytesRead = readSync(fd, buffer, 0, BINARY_CHECK_BUFFER_SIZE, 0)
    closeSync(fd)

    return buffer.slice(0, bytesRead).includes(0)
  }
  catch (error) {
    console.error(`Error reading file ${filePath}:`, error)
    return false
  }
}

export function buildFileNode(path: string): FileNode {
  const stats = statSync(path)
  const name = path.split('/').pop() || ''

  if (!stats.isDirectory())
    return { name, type: 'file' }

  return {
    name,
    type: 'directory',
    children: readdirSync(path)
      .map(child => buildFileNode(join(path, child))),
  }
}

export interface ContextOptions {
  ignorePaths?: string[]
  outputFormat?: 'txt' | 'xml'
  truncateJSON?: boolean
}

export function truncateJSON(content: string): string {
  let parsedJson: unknown
  try {
    parsedJson = JSON.parse(content)
  }
  catch {
    return content
  }

  if (Array.isArray(parsedJson))
    return JSON.stringify(parsedJson.slice(0, MAX_JSON_ARRAY_ITEMS), null, 2)

  if (typeof parsedJson === 'object' && parsedJson !== null) {
    const truncated = Object.fromEntries(
      Object.entries(parsedJson).slice(0, MAX_JSON_ENTRIES),
    )
    return JSON.stringify(truncated, null, 2)
  }

  return content
}

export function readFilesInDirectory(
  directoryPath: string,
  basePath: string,
  options: ContextOptions = {},
): { context: string, tokensMap: Map<string, number> } {
  const ignorePaths = [
    ...DEFAULT_IGNORE_PATHS,
    ...(options.ignorePaths || []),
  ]

  let context = ''
  const tokensMap = new Map<string, number>()

  let files: string[]

  try {
    files = readdirSync(directoryPath)
  }
  catch (error) {
    console.error(`Error reading directory ${directoryPath}:`, error)
    return { context: '', tokensMap }
  }

  for (const file of files) {
    const rel = relative(basePath, join(directoryPath, file))
    if (ignorePaths.includes(rel))
      continue
    if (ignorePaths.some(pattern => matchesPattern(rel, pattern)))
      continue

    const filePath = join(directoryPath, file)
    const stats = statSync(filePath)
    const relativePath = relative(basePath, filePath)

    // Skip directories that match ignore patterns
    if (stats.isDirectory()) {
      const { context: childContext, tokensMap: childTokens }
        = readFilesInDirectory(filePath, basePath, options)
      context += childContext
      // Merge child tokens into our tokensMap
      for (const [k, v] of childTokens)
        tokensMap.set(k, v)

      continue
    }

    // Skip specific files
    if (file.startsWith('llm-context'))
      continue
    if (isBinaryFile(filePath))
      continue

    try {
      let content = readFileSync(filePath, 'utf8')

      if (isJSONFile(filePath) && options.truncateJSON !== false)
        content = truncateJSON(content)

      // Compute tokens and store in the map
      const fileTokenCount = estimateTokens(content)
      tokensMap.set(relativePath, fileTokenCount)

      context += `<file name="${relativePath}">\n`
      context += `${content}\n`
      context += `</file>\n`
    }
    catch (error) {
      console.error(`Error reading file ${filePath}:`, error)
    }
  }

  return { context, tokensMap }
}
