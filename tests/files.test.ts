import { Buffer } from 'node:buffer'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { isBinaryFile, isJSONFile, readFilesInDirectory } from '../src/files.js'

describe('fileUtils', () => {
  const testDir = join(__dirname, 'test-files')

  beforeAll(() => {
    mkdirSync(testDir, { recursive: true })
  })

  afterAll(() => {
    rmSync(testDir, { recursive: true })
  })

  describe('isJSONFile', () => {
    it('should correctly identify JSON files', () => {
      expect(isJSONFile('test.json')).toBe(true)
      expect(isJSONFile('test.JSON')).toBe(true)
      expect(isJSONFile('test.txt')).toBe(false)
    })
  })

  describe('isBinaryFile', () => {
    it('should identify binary files', () => {
      const binaryPath = join(testDir, 'binary.bin')
      const textPath = join(testDir, 'text.txt')

      const binaryData = Buffer.from([0, 1, 2, 3])
      const textData = 'Hello, World!'

      writeFileSync(binaryPath, binaryData)
      writeFileSync(textPath, textData)

      expect(isBinaryFile(binaryPath)).toBe(true)
      expect(isBinaryFile(textPath)).toBe(false)
    })
  })
})

describe('readFilesInDirectory', () => {
  const testDir = join(__dirname, 'test-files')
  const exampleJson = JSON.stringify({ a: 1, b: 2, c: 3, d: 4, e: 5 }, null, 2)
  const truncatedJson = JSON.stringify({ a: 1, b: 2, c: 3, d: 4 }, null, 2)

  beforeAll(() => {
    mkdirSync(testDir, { recursive: true })
    writeFileSync(join(testDir, 'test.txt'), 'Hello')
    writeFileSync(join(testDir, 'test.json'), exampleJson)
    mkdirSync(join(testDir, 'subdir'))
    writeFileSync(join(testDir, 'subdir', 'nested.txt'), 'Nested')
  })

  afterAll(() => {
    rmSync(testDir, { recursive: true })
  })

  it('should read files and format them with tokenized delimiters', () => {
    const { context: result } = readFilesInDirectory(testDir, testDir)
    expect(result).toContain('<file name="test.txt">')
    expect(result).toContain('Hello')
    expect(result).toContain('</file>')
  })

  it('should include all files in the correct format', () => {
    const { context: result } = readFilesInDirectory(testDir, testDir)
    expect(result).toContain('<file name="test.txt">')
    expect(result).toContain('Hello')
    expect(result).toContain('<file name="test.json">')
    expect(result).toContain(truncatedJson)
    expect(result).toContain('<file name="subdir/nested.txt">')
    expect(result).toContain('Nested')
  })

  it('should truncate JSON files by default', () => {
    const { context: result } = readFilesInDirectory(testDir, testDir)
    expect(result).toContain(truncatedJson)
    expect(result).not.toContain('"e": 5') // Ensure that the extra key is not included
  })

  it('should respect ignore paths', () => {
    const { context: result } = readFilesInDirectory(testDir, testDir, {
      ignorePaths: ['subdir'],
    })
    expect(result).not.toContain('nested.txt')
    expect(result).not.toContain('File: subdir/nested.txt')
  })

  it('should handle ignore wildcards', () => {
    // Create test files with "tree" in name
    writeFileSync(join(testDir, 'tree.txt'), 'Tree content')
    writeFileSync(join(testDir, 'mytree.js'), 'console.log("tree")')
    writeFileSync(join(testDir, 'treefile.md'), '# Tree doc')
    writeFileSync(join(testDir, 'normal.txt'), 'Normal file')

    const { context: result } = readFilesInDirectory(testDir, testDir, {
      ignorePaths: ['*tree*'],
    })

    // Should include files without "tree"
    expect(result).toContain('<file name="normal.txt">')
    expect(result).toContain('<file name="test.txt">')
    expect(result).toContain('<file name="test.json">')
    expect(result).toContain('<file name="subdir/nested.txt">')

    // Should exclude files with "tree"
    expect(result).not.toContain('<file name="tree.txt">')
    expect(result).not.toContain('<file name="mytree.js">')
    expect(result).not.toContain('<file name="treefile.md">')
  })

  it('should ignore nested folder like "web/src"', () => {
    // Create web/src structure
    mkdirSync(join(testDir, 'web', 'src'), { recursive: true })
    writeFileSync(join(testDir, 'web', 'src', 'nestedFile.txt'), 'Hello')

    const { context } = readFilesInDirectory(testDir, testDir, {
      ignorePaths: ['web/src'],
    })

    expect(context).not.toContain('nestedFile.txt')
  })

  it('should return tokensMap for each file', () => {
    const { tokensMap } = readFilesInDirectory(testDir, testDir)

    expect(tokensMap.has('test.txt')).toBe(true)
    expect(tokensMap.get('test.txt')).toBeGreaterThanOrEqual(1)
  })
})

describe('login dir ignore check', () => {
  const testDir = join(__dirname, 'test-login')

  beforeAll(() => {
    rmSync(testDir, { recursive: true, force: true })
    mkdirSync(join(testDir, 'login'), { recursive: true })
    // Some dummy file to ensure the dir has content
    writeFileSync(join(testDir, 'login', 'stuff.ts'), 'console.log("Login stuff")')
  })

  afterAll(() => {
    rmSync(testDir, { recursive: true, force: true })
  })

  it('should NOT ignore login folder by default', () => {
    const { context } = readFilesInDirectory(testDir, testDir)
    expect(context).toContain('<file name="login/stuff.ts">')
  })
})
