import { describe, expect, it } from 'vitest'
import { formatFileSize, getFileRejection } from './file'

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

describe('formatFileSize', () => {
  it('1MB 이상은 소수 첫째 자리까지 MB로 표시', () => {
    expect(formatFileSize(8.2 * 1024 * 1024)).toBe('8.2MB')
    expect(formatFileSize(1024 * 1024)).toBe('1MB')
    expect(formatFileSize(10 * 1024 * 1024)).toBe('10MB')
  })

  it('1MB 미만은 KB로 내려서 표시', () => {
    expect(formatFileSize(512 * 1024)).toBe('512KB')
    expect(formatFileSize(1024 * 1024 - 1)).toBe('1023KB')
  })

  it('1KB 미만도 1KB로 표시', () => {
    expect(formatFileSize(0)).toBe('1KB')
    expect(formatFileSize(100)).toBe('1KB')
  })
})
