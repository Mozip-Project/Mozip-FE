import { useState, type ChangeEvent } from 'react'
import { getFileRejection, type FileRejection, type FileRule } from '@/utils/file'

// 이미지 한 장 업로드 공통 규칙
const IMAGE_FILE_RULE = {
  acceptedTypes: ['image/png', 'image/jpeg'],
  maxSizeBytes: 10 * 1024 * 1024,
} satisfies FileRule

const IMAGE_REJECTION_MESSAGES = {
  invalidType: 'PNG, JPG 이미지만 업로드 가능해요',
  oversized: '10MB 이하의 이미지만 업로드 가능해요',
} satisfies Record<FileRejection, string>

function useImageFilePicker(onSelect: (file: File) => void) {
  const [rejection, setRejection] = useState<FileRejection | null>(null)

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }
    const nextRejection = getFileRejection(file, IMAGE_FILE_RULE)
    setRejection(nextRejection)

    if (!nextRejection) {
      onSelect(file)
    }
  }

  return {
    clearError: () => setRejection(null),
    errorMessage: rejection ? IMAGE_REJECTION_MESSAGES[rejection] : null,
    inputProps: {
      type: 'file',
      accept: IMAGE_FILE_RULE.acceptedTypes.join(','),
      onChange: handleChange,
    },
  } as const
}

export { useImageFilePicker }
