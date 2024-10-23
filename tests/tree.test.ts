import { mkdirSync, rmdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getTreeOutput } from '../src/tree.js'

describe('tree.util', () => {
  const testDir = join(__dirname, 'test-tree')

  beforeAll(() => {
    mkdirSync(testDir, { recursive: true })
    mkdirSync(join(testDir, 'dir1'))
    writeFileSync(join(testDir, 'dir1', 'file1.txt'), 'test')
    writeFileSync(join(testDir, 'file2.txt'), 'test')
  })

  afterAll(() => {
    rmdirSync(testDir, { recursive: true })
  })

  describe('getTreeOutput', () => {
    it('should generate tree output in XML format', () => {
      const result = getTreeOutput(testDir)
      expect(result).toContain('<tree>')
      expect(result).toContain('.')
      expect(result).toContain('├── dir1')
      expect(result).toContain('│   └── file1.txt')
      expect(result).toContain('└── file2.txt')
      expect(result).toContain('</tree>')
    })

    it('should respect ignore paths', () => {
      mkdirSync(join(testDir, 'node_modules'))
      const result = getTreeOutput(testDir, ['node_modules'])
      expect(result).not.toContain('node_modules')
    })
  })
})
