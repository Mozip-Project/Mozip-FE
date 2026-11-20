import { useState } from 'react'
import { useReportPostingMutation } from '@/features/posting/api/applicant/queries'
import type { ReportReason } from '@/gql/graphql'
import { ApiError } from '@/lib/apiError'
import { useToast } from '@/providers/toastProvider'

const ALREADY_REPORTED_CODE = 'REPORT_409'

type UsePostingReportFormOptions = {
  postingId: string
  // 접수됐거나 이미 신고한 공고라 더 입력할 게 없을 때 호출
  onClose: () => void
}

function usePostingReportForm({ postingId, onClose }: UsePostingReportFormOptions) {
  const [reason, setReason] = useState<ReportReason | null>(null)
  const [detail, setDetail] = useState('')
  const { mutate: reportPosting, isPending } = useReportPostingMutation()
  const { showToast } = useToast()

  const canSubmit = reason !== null && !isPending

  // 입력을 유지한 채 다시 시도할 수 있도록 다이얼로그는 열어 둠
  function showReportFailedToast() {
    // TODO: 실패 안내 문구 디자이너 확인
    showToast({ title: '신고하지 못했어요. 잠시 후 다시 시도해 주세요.', icon: 'alert' })
  }

  function submit() {
    if (reason === null || isPending) {
      return
    }

    reportPosting(
      { postingId, reason, detail: detail.trim() === '' ? undefined : detail },
      {
        onSuccess: (isReported) => {
          if (!isReported) {
            showReportFailedToast()
            return
          }
          onClose()
          showToast({ title: '신고가 접수됐어요. 확인 후 조치할게요.' })
        },
        onError: (error) => {
          if (error instanceof ApiError && error.code === ALREADY_REPORTED_CODE) {
            onClose()
            showToast({ title: '이미 신고한 공고예요.', icon: 'alert' })
            return
          }
          showReportFailedToast()
        },
      },
    )
  }

  function reset() {
    setReason(null)
    setDetail('')
  }

  return {
    reason,
    detail,
    changeReason: setReason,
    changeDetail: setDetail,
    canSubmit,
    isPending,
    submit,
    reset,
  }
}

export { usePostingReportForm }
