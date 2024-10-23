import { mkdirSync, rmdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { Buffer } from 'node:buffer'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { isBinaryFile, isJSONFile, readFilesInDirectory } from '../src/files.js'

describe('fileUtils', () => {
  const testDir = join(__dirname, 'test-files')

  beforeAll(() => {
    mkdirSync(testDir, { recursive: true })
  })

  afterAll(() => {
    rmdirSync(testDir, { recursive: true })
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

  it('should read files in text format', () => {
    const result = readFilesInDirectory(testDir, testDir)
    expect(result).toContain('# test.txt')
    expect(result).toContain('Hello')
    expect(result).toContain('# subdir/nested.txt')
    expect(result).toContain('Nested')
  })

  it('should read files in XML format', () => {
    const result = readFilesInDirectory(testDir, testDir, {
      outputFormat: 'xml',
    })
    expect(result).toContain('<file name="test.txt">')
    expect(result).toContain('Hello')
    expect(result).toContain('</file>')
  })

  it('should truncate JSON files by default', () => {
    const result = readFilesInDirectory(testDir, testDir)
    expect(result).toContain(truncatedJson)
  })

  it('should respect ignore paths', () => {
    const result = readFilesInDirectory(testDir, testDir, {
      ignorePaths: ['subdir'],
    })
    expect(result).not.toContain('nested.txt')
  })
})
