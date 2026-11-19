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

export { getFileRejection }
export type { FileRejection, FileRule }
