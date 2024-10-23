#!/usr/bin/env node
import { join } from 'node:path'
import { cwd } from 'node:process'
import { writeFileSync } from 'node:fs'
import { program } from 'commander'
import { type ContextOptions, readFilesInDirectory } from './files.js'
import { getTreeOutput } from './tree.js'

program
  .name('llm-context')
  .description('CLI to build context files for LLMs')
  .version('1.0.0')
  .argument('<directory>', 'Directory to process')
  .argument('<suffix>', 'Output file suffix')
  .option('-i, --ignore <paths...>', 'Additional paths to ignore')
  .option('-f, --format <format>', 'Output format (txt or xml)', 'xml')
  .action((directory: string, suffix: string, options: ContextOptions) => {
    const directoryPath = join(cwd(), directory)
    const outputPath = `llm-context.${suffix}.txt`

    let context = getTreeOutput(directoryPath, options.ignorePaths)
    context += readFilesInDirectory(directoryPath, directoryPath, options)

    writeFileSync(outputPath, context)
    console.log(`Context file created at: ${outputPath}`)
  })

program.parse()
