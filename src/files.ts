import { closeSync, openSync, readFileSync, readSync, readdirSync, statSync } from 'node:fs'
import { extname, join, relative } from 'node:path'
import { Buffer } from 'node:buffer'
import { BINARY_CHECK_BUFFER_SIZE, DEFAULT_IGNORE_PATHS, MAX_JSON_ARRAY_ITEMS, MAX_JSON_ENTRIES } from './constants.js'

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
  catch (error) {
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
): string {
  const ignorePaths = new Set([
    ...DEFAULT_IGNORE_PATHS,
    ...(options.ignorePaths || []),
  ])

  let context = ''
  let files: string[]

  try {
    files = readdirSync(directoryPath)
  }
  catch (error) {
    console.error(`Error reading directory ${directoryPath}:`, error)
    return context
  }

  for (const file of files) {
    if (ignorePaths.has(file))
      continue

    const filePath = join(directoryPath, file)
    const stats = statSync(filePath)
    const relativePath = relative(basePath, filePath)

    // Skip directories that match ignore patterns
    if (stats.isDirectory()) {
      context += readFilesInDirectory(filePath, basePath, options)
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

      context += `<file name="${relativePath}">\n`
      context += `${content}\n`
      context += `</file>\n`
    }
    catch (error) {
      console.error(`Error reading file ${filePath}:`, error)
    }
  }

  return context
}
