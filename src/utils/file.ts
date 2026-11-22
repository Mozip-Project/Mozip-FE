type FileRejection = 'invalidType' | 'oversized'

type FileRule = {
  acceptedTypes: readonly string[]
  maxSizeBytes: number
}

function getFileRejection(file: File, { acceptedTypes, maxSizeBytes }: FileRule) {
  if (!acceptedTypes.includes(file.type)) {
    return 'invalidType' satisfies FileRejection
  }
  if (file.size > maxSizeBytes) {
    return 'oversized' satisfies FileRejection
  }
  return null
}

const BYTES_PER_KB = 1024
const BYTES_PER_MB = BYTES_PER_KB * 1024

// MB는 소수 첫째 자리까지, 1MB 미만은 KB 내림(최소 1KB)
function formatFileSize(bytes: number) {
  if (bytes >= BYTES_PER_MB) {
    return `${Number((bytes / BYTES_PER_MB).toFixed(1))}MB`
  }
  return `${Math.max(1, Math.floor(bytes / BYTES_PER_KB))}KB`
}

export { formatFileSize, getFileRejection }
export type { FileRejection, FileRule }
