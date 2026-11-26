import { useState, type ChangeEvent } from 'react'
import { getFileRejection, type FileRejection } from '@/utils/file'

// 화면마다 받는 형식·용량이 달라 그 안내 문구와 함께 넘김
type ImageFileRule = {
  acceptedTypes: readonly string[]
  invalidTypeMessage: string
  maxSizeBytes: number
  oversizedMessage: string
}

// 이미지 한 장 업로드 기본 규칙
const DEFAULT_IMAGE_FILE_RULE = {
  acceptedTypes: ['image/png', 'image/jpeg'],
  invalidTypeMessage: 'PNG, JPG 이미지만 업로드 가능해요',
  maxSizeBytes: 10 * 1024 * 1024,
  oversizedMessage: '10MB 이하의 이미지만 업로드 가능해요',
} satisfies ImageFileRule

function useImageFilePicker(
  onSelect: (file: File) => void,
  fileRule: ImageFileRule = DEFAULT_IMAGE_FILE_RULE,
) {
  const [rejection, setRejection] = useState<FileRejection | null>(null)
  const rejectionMessages = {
    invalidType: fileRule.invalidTypeMessage,
    oversized: fileRule.oversizedMessage,
  } satisfies Record<FileRejection, string>

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }
    const nextRejection = getFileRejection(file, fileRule)
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
      accept: fileRule.acceptedTypes.join(','),
      onChange: handleChange,
    },
  } as const
}

export { useImageFilePicker }
export type { ImageFileRule }
