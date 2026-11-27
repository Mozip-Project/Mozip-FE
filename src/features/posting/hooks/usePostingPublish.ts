import { useRouter } from 'next/navigation'
import { usePublishPostingMutation } from '@/features/posting/api/organizer/queries'
import type { PostingCreateStep } from '@/features/posting/utils/postingCreateSteps'
import type { DraftStepId } from '@/features/posting/utils/postingDraftInput'
import { getFirstPublishErrorStepId } from '@/features/posting/utils/postingPublishError'
import { getPostingManageDetailPath } from '@/features/recruitment/utils/recruitmentRoutes'
import { ApiError } from '@/lib/apiError'
import { useToast } from '@/providers/toastProvider'

const PUBLISH_FAILED_MESSAGE = '잠시 후 다시 시도해 주세요'

type UsePostingPublishParams = {
  stepIds: readonly PostingCreateStep['id'][]
  // 서버 게시 검사에 걸린 단계로 이동
  onInvalidStep: (stepId: DraftStepId) => void
}

function usePostingPublish({ stepIds, onInvalidStep }: UsePostingPublishParams) {
  const router = useRouter()
  const { mutateAsync, isPending } = usePublishPostingMutation()
  const { showToast } = useToast()

  function showPublishError(error: unknown) {
    if (!(error instanceof ApiError)) {
      showToast({ title: '게시하지 못했어요', description: PUBLISH_FAILED_MESSAGE, icon: 'alert' })
      return
    }

    switch (error.code) {
      case 'POSTING_400': {
        const stepId = getFirstPublishErrorStepId(error.fieldErrors, stepIds)
        if (stepId) {
          onInvalidStep(stepId)
        }
        const messages = [...new Set(error.fieldErrors.map(({ message }) => message))]
        showToast({
          title: '게시하기 전에 확인해 주세요',
          description: messages.join(' ') || error.message,
          icon: 'alert',
        })
        return
      }
      case 'POSTING_409':
        showToast({ title: '이미 게시된 공고예요', icon: 'alert' })
        return
      case 'ORG_402':
        showToast({ title: '이용권이 있어야 공고를 게시할 수 있어요', icon: 'alert' })
        return
      default:
        showToast({ title: '게시하지 못했어요', description: error.message, icon: 'alert' })
    }
  }

  // 성공하면 게시한 공고의 관리 화면으로 이동, 실패하면 false
  async function publish(postingId: string | null) {
    if (!postingId) {
      showToast({ title: '공고를 먼저 저장해 주세요', icon: 'info' })
      return false
    }

    try {
      await mutateAsync(postingId)
      showToast({ title: '공고를 게시했어요' })
      router.push(getPostingManageDetailPath(postingId))
      return true
    } catch (error) {
      showPublishError(error)
      return false
    }
  }

  return { publish, isPublishing: isPending }
}

export { usePostingPublish }
