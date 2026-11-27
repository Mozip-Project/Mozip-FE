import { useRef, useState } from 'react'
import type { SaveState } from '@/components/ui/SaveStatus/saveStatus'
import { useSavePostingDraftMutation } from '@/features/posting/api/organizer/queries'
import type { PostingCreateValues } from '@/features/posting/schemas/postingCreateValues'
import { getPostingEditPath } from '@/features/posting/utils/postingCreateRoute'
import { toDraftStepInput, type DraftStepId } from '@/features/posting/utils/postingDraftInput'
import {
  getSavedPositions,
  hasDetachedQuestions,
  type SavedPosition,
} from '@/features/posting/utils/postingDraftValues'
import { ApiError } from '@/lib/apiError'
import { FileUploadError, uploadFile } from '@/lib/fileUpload'
import { useToast } from '@/providers/toastProvider'

const SAVE_FAILED_MESSAGE = '잠시 후 다시 시도해 주세요'
const UPLOAD_FAILED_MESSAGE = '대표 이미지를 올리지 못했어요. 잠시 후 다시 시도해 주세요'

type UploadedImage = {
  file: File
  fileKey: string
}

// 이어서 작성할 때 불러온 공고
type SavedPostingDraft = {
  id: string
  positions: SavedPosition[]
  updatedAt: string
}

type UsePostingDraftSaveParams = {
  organizationId: string | null
  hasInterview: boolean
  savedDraft?: SavedPostingDraft
}

// 입력별 메시지가 있으면 첫 메시지, 없으면 서버 메시지
function getSaveErrorMessage(error: unknown) {
  if (error instanceof FileUploadError) {
    return UPLOAD_FAILED_MESSAGE
  }
  if (!(error instanceof ApiError)) {
    return SAVE_FAILED_MESSAGE
  }
  return error.fieldErrors[0]?.message ?? error.message
}

// 첫 저장에서 공고를 만들고 주소를 편집 주소로 바꿈, 화면은 다시 그리지 않아 입력 중인 값 유지
function usePostingDraftSave({
  organizationId,
  hasInterview,
  savedDraft,
}: UsePostingDraftSaveParams) {
  const [postingId, setPostingId] = useState(savedDraft?.id ?? null)
  // 게시 전 여러 단계를 이어 저장할 때 앞 저장의 포지션 id를 바로 쓰도록 ref 사용
  const savedPositionsRef = useRef(savedDraft?.positions ?? [])
  const [saveState, setSaveState] = useState<SaveState>(
    savedDraft ? { status: 'saved', savedAt: new Date(savedDraft.updatedAt) } : { status: 'idle' },
  )
  const { mutateAsync } = useSavePostingDraftMutation()
  const { showToast } = useToast()
  // 같은 파일로 다시 저장할 때 또 올리지 않도록 마지막으로 올린 이미지 기억
  const uploadedImageRef = useRef<UploadedImage | null>(null)

  // 공고 정보 단계에서 새로 고른 대표 이미지만 올림, 없으면 images를 보내지 않아 서버 값 유지
  async function uploadMainImage(stepId: DraftStepId, mainImage: File | null) {
    if (stepId !== 'info' || !mainImage) {
      return undefined
    }
    if (uploadedImageRef.current?.file === mainImage) {
      return uploadedImageRef.current.fileKey
    }
    const { fileKey } = await uploadFile(mainImage, 'POSTING_IMAGE')
    uploadedImageRef.current = { file: mainImage, fileKey }
    return fileKey
  }

  async function saveStep(stepId: DraftStepId, values: PostingCreateValues) {
    if (!organizationId) {
      return false
    }

    setSaveState({ status: 'saving' })
    try {
      const mainImageFileKey = await uploadMainImage(stepId, values.mainImage)
      let posting = await mutateAsync({
        organizationId,
        id: postingId,
        input: toDraftStepInput(stepId, values, hasInterview, {
          savedPositions: savedPositionsRef.current,
          mainImageFileKey,
        }),
      })
      if (!postingId) {
        setPostingId(posting.id)
        window.history.replaceState(null, '', getPostingEditPath(posting.id))
      }
      // 다시 연결하는 요청이 실패해도 다음 저장이 새 포지션 id를 쓰도록 먼저 반영
      const savedPositionsAfterSave = getSavedPositions(posting)
      savedPositionsRef.current = savedPositionsAfterSave
      // 포지션이 새 id로 바뀌어 연결이 끊긴 문항을 새 id로 다시 저장
      if (hasDetachedQuestions(posting)) {
        posting = await mutateAsync({
          organizationId,
          id: posting.id,
          input: toDraftStepInput('form', values, hasInterview, {
            savedPositions: savedPositionsAfterSave,
          }),
        })
      }
      setSaveState({ status: 'saved', savedAt: new Date(posting.updatedAt) })
      return true
    } catch (error) {
      setSaveState({ status: 'failed' })
      showToast({
        title: '저장하지 못했어요',
        description: getSaveErrorMessage(error),
        icon: 'alert',
      })
      return false
    }
  }

  return {
    postingId,
    saveState,
    // 대표 이미지 업로드부터 저장 완료까지 중복 저장 방지
    isSaving: saveState.status === 'saving',
    canSave: organizationId !== null,
    saveStep,
  }
}

export { usePostingDraftSave }
export type { SavedPostingDraft }
