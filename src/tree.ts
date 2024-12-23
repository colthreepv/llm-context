import { readdirSync, statSync } from 'node:fs'
import { basename, join, relative } from 'node:path'
import { DEFAULT_IGNORE_PATHS } from './constants.js'
import { matchesPattern } from './ignore.js'

interface TreeNode {
  name: string
  type: 'file' | 'directory'
  children?: TreeNode[]
  tokenCount?: number // so we can store the computed tokens
}

export function getTreeOutput(
  directoryPath: string,
  additionalPaths: string[] = [],
  tokensMap?: Map<string, number>,
  basePath?: string,
): string {
  const ignorePaths = [
    ...DEFAULT_IGNORE_PATHS,
    ...(additionalPaths || []),
  ]

  const tree = buildTree(directoryPath, ignorePaths, tokensMap, basePath)
  const treeString = formatTreeOutput(tree)

  return `<tree>\n${treeString}\n</tree>`
}

function buildTree(
  dirPath: string,
  ignorePaths: string[],
  tokensMap?: Map<string, number>,
  basePath?: string,
): TreeNode {
  const name = basename(dirPath)
  const stats = statSync(dirPath)
  const node: TreeNode = { name, type: stats.isDirectory() ? 'directory' : 'file' }

  if (stats.isDirectory()) {
    node.children = []
    const entries = readdirSync(dirPath)

    for (const entry of entries) {
      if (ignorePaths.includes(entry))
        continue
      if (ignorePaths.some(pattern => matchesPattern(entry, pattern)))
        continue

      const fullPath = join(dirPath, entry)
      const childNode = buildTree(fullPath, ignorePaths, tokensMap, basePath)
      node.children.push(childNode)
    }

    // Sort directories and files separately for consistent output
    node.children.sort((a, b) => {
      if (a.type === b.type)
        return a.name.localeCompare(b.name)
      return a.type === 'directory' ? -1 : 1
    })

    // After building all children, compute directory-level sum
    let directoryTokenSum = 0
    for (const child of node.children) {
      if (child.tokenCount)
        directoryTokenSum += child.tokenCount
    }
    node.tokenCount = directoryTokenSum
  }
  else { // If it’s a file, we can try to find it in tokensMap
    if (tokensMap && basePath) {
      const relPath = join(relative(basePath, dirPath))
      const tokCount = tokensMap.get(relPath)
      if (tokCount)
        node.tokenCount = tokCount
    }
  }

  return node
}

function formatTreeOutput(node: TreeNode, prefix = '', isLast = true): string {
  let treeStr = prefix

  if (prefix.length > 0)
    treeStr += isLast ? '└── ' : '├── '

  treeStr += node.tokenCount
    ? `${node.name} (${node.tokenCount})\n`
    : `${node.name}\n`

  if (node.type === 'directory' && node.children && node.children.length > 0) {
    const newPrefix = prefix + (isLast ? '    ' : '│   ')
    const childCount = node.children.length

    for (let i = 0; i < childCount; i++) {
      const child = node.children[i]!
      const isChildLast = i === childCount - 1
      treeStr += formatTreeOutput(child, newPrefix, isChildLast)
    }
  }

  return treeStr
}
