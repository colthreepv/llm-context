import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
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
    rmSync(testDir, { recursive: true })
  })

  describe('getTreeOutput', () => {
    it('should generate tree output in XML format', () => {
      const result = getTreeOutput(testDir, [], new Map<string, number>(), testDir)
      expect(result).toContain('<tree>')
      expect(result).toContain('.')
      expect(result).toContain('├── dir1')
      expect(result).toContain('│   └── file1.txt')
      expect(result).toContain('└── file2.txt')
      expect(result).toContain('</tree>')
    })

    it('should respect ignore paths', () => {
      mkdirSync(join(testDir, 'node_modules'))
      const result = getTreeOutput(testDir, ['node_modules'], new Map<string, number>(), testDir)
      expect(result).not.toContain('node_modules')
    })

    it('should ignore nested folder like "web/src"', () => {
      // Create web/src structure
      mkdirSync(join(testDir, 'web', 'src'), { recursive: true })
      writeFileSync(join(testDir, 'web', 'src', 'nestedFile.txt'), 'Hello')

      const result = getTreeOutput(testDir, ['node_modules', 'web/src'], new Map<string, number>(), testDir)
      expect(result).not.toContain('nestedFile.txt')
    })

    it('should handle ignore wildcards', () => {
      writeFileSync(join(testDir, 'foo.txt'), 'Foo content')
      writeFileSync(join(testDir, 'myfoo.js'), 'console.log("foo")')
      writeFileSync(join(testDir, 'foofile.md'), '# Foo doc')
      writeFileSync(join(testDir, 'normal.txt'), 'Normal file')

      const result = getTreeOutput(testDir, ['*foo*'], new Map<string, number>(), testDir)

      // Should include files without "tree"
      expect(result).toContain('file1.txt')
      expect(result).toContain('file2.txt')
      expect(result).toContain('normal.txt')
      expect(result).toContain('dir1')

      // Should exclude files with "tree"
      expect(result).not.toContain('foo.txt')
      expect(result).not.toContain('myfoo.js')
      expect(result).not.toContain('foofile.md')
    })
  })
})
