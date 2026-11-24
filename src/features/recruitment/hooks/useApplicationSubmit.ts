import { useRouter } from 'next/navigation'
import { getApplicationPostingDetailPath } from '@/features/posting/utils/postingRoutes'
import { useSubmitApplicationMutation } from '@/features/recruitment/api/applicant/queries'
import type { ApplicationInput } from '@/gql/graphql'
import { ApiError } from '@/lib/apiError'
import { useToast } from '@/providers/toastProvider'

// 이미 제출한 지원서도 제출 결과 화면으로 이동
const ALREADY_SUBMITTED_CODE = 'APPLICATION_409'

function useApplicationSubmit(postingId: string) {
  const router = useRouter()
  const { showToast } = useToast()
  const { mutate: submitApplication, isPending: isSubmitting } = useSubmitApplicationMutation()

  // 제출 뒤 뒤로 가기로 지원서 화면에 돌아오지 않도록 replace
  function moveToSubmittedApplication() {
    router.replace(getApplicationPostingDetailPath(postingId))
  }

  function submit(input: ApplicationInput) {
    submitApplication(
      { postingId, input },
      {
        onSuccess: moveToSubmittedApplication,
        onError: (error) => {
          if (error instanceof ApiError && error.code === ALREADY_SUBMITTED_CODE) {
            moveToSubmittedApplication()
            return
          }
          // 입력을 유지한 채 다시 시도할 수 있도록 다이얼로그는 열어 둠
          // TODO: 실패 안내 문구·오류 코드별 안내 디자이너 확인
          showToast({
            title: '지원서를 제출하지 못했어요. 잠시 후 다시 시도해 주세요.',
            icon: 'alert',
          })
        },
      },
    )
  }

  return { submit, isSubmitting }
}

export { useApplicationSubmit }
