import { useState } from 'react'
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
import { useToast } from '@/providers/toastProvider'

const SAVE_FAILED_MESSAGE = '잠시 후 다시 시도해 주세요'

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
  const [savedPositions, setSavedPositions] = useState(savedDraft?.positions ?? [])
  const [saveState, setSaveState] = useState<SaveState>(
    savedDraft ? { status: 'saved', savedAt: new Date(savedDraft.updatedAt) } : { status: 'idle' },
  )
  const { mutateAsync, isPending } = useSavePostingDraftMutation()
  const { showToast } = useToast()

  async function saveStep(stepId: DraftStepId, values: PostingCreateValues) {
    if (!organizationId) {
      return false
    }

    setSaveState({ status: 'saving' })
    try {
      let posting = await mutateAsync({
        organizationId,
        id: postingId,
        input: toDraftStepInput(stepId, values, hasInterview, { savedPositions }),
      })
      if (!postingId) {
        setPostingId(posting.id)
        window.history.replaceState(null, '', getPostingEditPath(posting.id))
      }
      // 포지션이 새 id로 바뀌어 연결이 끊긴 문항을 새 id로 다시 저장
      if (hasDetachedQuestions(posting)) {
        posting = await mutateAsync({
          organizationId,
          id: posting.id,
          input: toDraftStepInput('form', values, hasInterview, {
            savedPositions: getSavedPositions(posting),
          }),
        })
      }
      setSavedPositions(getSavedPositions(posting))
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
    isSaving: isPending,
    canSave: organizationId !== null,
    saveStep,
  }
}

export { usePostingDraftSave }
export type { SavedPostingDraft }
