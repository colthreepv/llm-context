#!/usr/bin/env node
import { join } from 'node:path'
import { cwd } from 'node:process'
import { writeFileSync } from 'node:fs'
import { program } from 'commander'
import { type ContextOptions, readFilesInDirectory } from './files.js'
import { getTreeOutput } from './tree.js'

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3.622831)
}

program
  .name('llm-context')
  .description('CLI to build context files for LLMs')
  .version('1.0.0')
  .argument('<directory>', 'Directory to process')
  .argument('<suffix>', 'Output file suffix')
  .option('-i, --ignore <paths...>', 'Additional paths to ignore')
  .action((directory: string, suffix: string, options: ContextOptions) => {
    const directoryPath = join(cwd(), directory)
    const outputPath = `llm-context.${suffix}.txt`

    // Generate the tree output and context content
    const treeOutput = getTreeOutput(directoryPath, options.ignorePaths)
    const contextContent = readFilesInDirectory(directoryPath, directoryPath, options)

    // Combine the tree output and context content
    const context = `${treeOutput}\n${contextContent}`

    // Write the combined context to the output file
    writeFileSync(outputPath, context)
    console.log(`Context file created at: ${outputPath}`)

    // Estimate the tokens of the produced context
    const estimatedTokens = estimateTokens(context)

    // Print the report to the user
    console.log('\nReport:')
    console.log(treeOutput)
    console.log(`\nEstimated Tokens: ${estimatedTokens}`)
  })

program.parse()
