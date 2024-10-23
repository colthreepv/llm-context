import { readdirSync, statSync } from 'node:fs'
import { basename, join } from 'node:path'
import { DEFAULT_IGNORE_PATHS } from './constants.js'

interface TreeNode {
  name: string
  type: 'file' | 'directory'
  children?: TreeNode[]
}

export function getTreeOutput(directoryPath: string, additionalPaths: string[] = []): string {
  const ignorePaths = new Set([...DEFAULT_IGNORE_PATHS, ...additionalPaths])

  const tree = buildTree(directoryPath, ignorePaths)
  const treeString = formatTreeOutput(tree)

  return `<tree>\n${treeString}\n</tree>`
}

function buildTree(dirPath: string, ignorePaths: Set<string>): TreeNode {
  const name = basename(dirPath)
  const stats = statSync(dirPath)
  const node: TreeNode = { name, type: stats.isDirectory() ? 'directory' : 'file' }

  if (stats.isDirectory()) {
    node.children = []
    const entries = readdirSync(dirPath)

    for (const entry of entries) {
      if (ignorePaths.has(entry))
        continue

      const fullPath = join(dirPath, entry)
      const childNode = buildTree(fullPath, ignorePaths)
      node.children.push(childNode)
    }

    // Sort directories and files separately for consistent output
    node.children.sort((a, b) => {
      if (a.type === b.type)
        return a.name.localeCompare(b.name)
      return a.type === 'directory' ? -1 : 1
    })
  }

  return node
}

function formatTreeOutput(node: TreeNode, prefix = '', isLast = true): string {
  let treeStr = prefix

  if (prefix.length > 0)
    treeStr += isLast ? '└── ' : '├── '

  treeStr += `${node.name}\n`

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
