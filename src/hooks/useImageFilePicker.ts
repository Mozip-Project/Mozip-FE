import { useState, type ChangeEvent } from 'react'
import { getFileRejection, type FileRejection } from '@/utils/file'

// 화면마다 받는 형식이 달라 형식과 그 안내 문구를 함께 넘김
type ImageFileFormat = {
  acceptedTypes: readonly string[]
  invalidTypeMessage: string
}

// 이미지 한 장 업로드 기본 형식
const DEFAULT_IMAGE_FILE_FORMAT = {
  acceptedTypes: ['image/png', 'image/jpeg'],
  invalidTypeMessage: 'PNG, JPG 이미지만 업로드 가능해요',
} satisfies ImageFileFormat

const IMAGE_MAX_SIZE_BYTES = 10 * 1024 * 1024
const OVERSIZED_MESSAGE = '10MB 이하의 이미지만 업로드 가능해요'

function useImageFilePicker(
  onSelect: (file: File) => void,
  fileFormat: ImageFileFormat = DEFAULT_IMAGE_FILE_FORMAT,
) {
  const [rejection, setRejection] = useState<FileRejection | null>(null)
  const rejectionMessages = {
    invalidType: fileFormat.invalidTypeMessage,
    oversized: OVERSIZED_MESSAGE,
  } satisfies Record<FileRejection, string>

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }
    const nextRejection = getFileRejection(file, {
      acceptedTypes: fileFormat.acceptedTypes,
      maxSizeBytes: IMAGE_MAX_SIZE_BYTES,
    })
    setRejection(nextRejection)

    if (!nextRejection) {
      onSelect(file)
    }
  }

  return {
    clearError: () => setRejection(null),
    errorMessage: rejection ? rejectionMessages[rejection] : null,
    inputProps: {
      type: 'file',
      accept: fileFormat.acceptedTypes.join(','),
      onChange: handleChange,
    },
  } as const
}

export { useImageFilePicker }
export type { ImageFileFormat }
