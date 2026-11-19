import { describe, expect, it } from 'vitest'
import { getFileRejection } from './file'

const PDF_RULE = { acceptedTypes: ['application/pdf'], maxSizeBytes: 20 * 1024 * 1024 }

function createFile(type: string, sizeBytes: number) {
  return new File([new Uint8Array(sizeBytes)], 'document', { type })
}

describe('getFileRejection', () => {
  it('허용 형식이고 최대 크기 이하면 null', () => {
    expect(getFileRejection(createFile('application/pdf', 1024), PDF_RULE)).toBeNull()
    expect(
      getFileRejection(createFile('application/pdf', PDF_RULE.maxSizeBytes), PDF_RULE),
    ).toBeNull()
  })

  it('허용하지 않은 형식이면 invalidType', () => {
    expect(getFileRejection(createFile('image/png', 1024), PDF_RULE)).toBe('invalidType')
    expect(getFileRejection(createFile('', 1024), PDF_RULE)).toBe('invalidType')
  })

  it('최대 크기를 넘으면 oversized', () => {
    expect(
      getFileRejection(createFile('application/pdf', PDF_RULE.maxSizeBytes + 1), PDF_RULE),
    ).toBe('oversized')
  })
})
