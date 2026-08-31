import { describe, it, expect } from 'vitest'
import { siteName } from '@/lib/site'

describe('site metadata', () => {
  it('expose le nom du site', () => {
    expect(siteName).toBe('yadony')
  })
})
