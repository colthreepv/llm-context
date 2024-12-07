import { readFileSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'))
let versionFile = readFileSync('./src/version.ts', 'utf8')

versionFile = versionFile.replace(
  /export const VERSION = ['"].*['"]/,
  `export const VERSION = '${pkg.version}'`,
)
writeFileSync('./src/version.ts', versionFile)
console.log('replaced version', pkg.version)

// Run build
execSync('tsc', { stdio: 'inherit' })
