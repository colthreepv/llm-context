import { describe, expect, it } from 'vitest'
import { truncateJSON } from '../src/files'

describe('json functions', () => {
  describe('truncateJSON', () => {
    it('should truncate arrays to 2 items', () => {
      const input = JSON.stringify([1, 2, 3, 4, 5])
      const result = truncateJSON(input)
      expect(JSON.parse(result)).toHaveLength(2)
    })

    it('should truncate objects to 4 entries', () => {
      const input = JSON.stringify({
        a: 1,
        b: 2,
        c: 3,
        d: 4,
        e: 5,
      })
      const result = truncateJSON(input)
      expect(Object.keys(JSON.parse(result))).toHaveLength(4)
    })

    it('should return original content for invalid JSON', () => {
      const input = 'invalid json'
      expect(truncateJSON(input)).toBe(input)
    })
  })
})
