import { useMutation, useQuery } from '@tanstack/react-query'
import {
  getApplicantProfile,
  getPostingMyApplications,
  saveApplicationDraft,
  submitApplication,
} from './api'
import { applicantApplicationKeys } from './keys'

function useApplicantProfileQuery() {
  return useQuery({
    queryKey: applicantApplicationKeys.profile,
    queryFn: getApplicantProfile,
  })
}

// 지원서 화면은 들어올 때마다 최신 임시 저장이 필요해 캐시가 새것이어도 다시 조회
function usePostingMyApplicationsQuery(postingId: string) {
  return useQuery({
    queryKey: applicantApplicationKeys.myApplications(postingId),
    queryFn: () => getPostingMyApplications(postingId),
    refetchOnMount: 'always',
  })
}

// 임시 저장·제출을 보낸 순서대로 처리해 늦게 도착한 이전 저장이 최신 내용을 덮지 않도록 처리
const APPLICATION_SAVE_SCOPE = { id: 'application-save' }

function useSaveApplicationDraftMutation() {
  return useMutation({ mutationFn: saveApplicationDraft, scope: APPLICATION_SAVE_SCOPE })
}

// 다시 들어오면 내 지원서를 항상 다시 조회해 제출 뒤 캐시 갱신 생략
function useSubmitApplicationMutation() {
  return useMutation({ mutationFn: submitApplication, scope: APPLICATION_SAVE_SCOPE })
}

export {
  useApplicantProfileQuery,
  usePostingMyApplicationsQuery,
  useSaveApplicationDraftMutation,
  useSubmitApplicationMutation,
}
