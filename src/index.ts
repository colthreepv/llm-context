#!/usr/bin/env node
import { parseArgs } from 'node:util'
import { join } from 'node:path'
import { cwd, exit } from 'node:process'
import { writeFileSync } from 'node:fs'
import { estimateTokens, readFilesInDirectory } from './files.js'
import { getTreeOutput } from './tree.js'
import { VERSION } from './version.js'

function printUsage() {
  console.log(`
Usage: llm-context <directory> <suffix> [options]

Arguments:
  directory                Directory to process
  suffix                   Output file suffix

Options:
  -i, --ignore <paths...>  Additional paths to ignore
  -h, --help               Show help
  -v, --version            Show version
`)
}

const {
  positionals,
  values: { ignore: ignorePaths, help, version },
} = parseArgs({
  allowPositionals: true,
  options: {
    ignore: {
      type: 'string',
      short: 'i',
      multiple: true,
    },
    help: {
      type: 'boolean',
      short: 'h',
    },
    version: {
      type: 'boolean',
      short: 'v',
    },
  },
})

if (help) {
  printUsage()
  exit(0)
}

if (version) {
  console.log(VERSION)
  exit(0)
}

if (positionals.length < 2) {
  console.error('Error: Please provide both directory and suffix arguments')
  printUsage()
  exit(1)
}

const [directory, suffix] = positionals
const directoryPath = join(cwd(), directory!)
const outputPath = `llm-context.${suffix}.txt`

if (Array.isArray(ignorePaths))
  console.log('Ignoring paths:', ignorePaths)

const { context: contextContent, tokensMap }
  = readFilesInDirectory(directoryPath, directoryPath, { ignorePaths })
const treeOutput = getTreeOutput(directoryPath, ignorePaths, tokensMap, directoryPath)
const context = `${treeOutput}\n${contextContent}`

writeFileSync(outputPath, context)
console.log(`\nContext file created at: ${outputPath}`)
const estimatedTokens = estimateTokens(context)

console.log('\nReport:')
console.log(treeOutput)
console.log(`\nEstimated Tokens: ${estimatedTokens}`)
