import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import type { MyAccountFieldsFragment } from '@/gql/graphql'
import {
  changePassword,
  getMe,
  getMyAccount,
  requestPhoneChange,
  updateNotificationSettings,
  updateProfile,
  verifyPhoneChange,
} from './api'
import { userKeys, userMutationKeys } from './keys'

type NotificationSettingKey = keyof MyAccountFieldsFragment['notificationSettings']

type NotificationSettingChange = {
  key: NotificationSettingKey
  isEnabled: boolean
}

function useMeQuery() {
  return useQuery({
    queryKey: userKeys.me,
    queryFn: getMe,
  })
}

function useMyAccountQuery() {
  return useQuery({
    queryKey: userKeys.myAccount,
    queryFn: getMyAccount,
  })
}

function setNotificationSetting(
  queryClient: QueryClient,
  key: NotificationSettingKey,
  isEnabled: boolean,
) {
  queryClient.setQueryData<MyAccountFieldsFragment>(userKeys.myAccount, (account) =>
    account
      ? { ...account, notificationSettings: { ...account.notificationSettings, [key]: isEnabled } }
      : account,
  )
}

function isLastPendingChange(queryClient: QueryClient) {
  return queryClient.isMutating({ mutationKey: userMutationKeys.updateNotificationSettings }) === 1
}

// 토글 하나씩 낙관적으로 반영하고, 실패하면 그 토글만 되돌림
// 응답 도착 순서가 서버 처리 순서와 다를 수 있어 응답 대신 마지막 요청이 끝날 때 다시 조회
function useUpdateNotificationSettingMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: userMutationKeys.updateNotificationSettings,
    mutationFn: ({ key, isEnabled }: NotificationSettingChange) =>
      updateNotificationSettings({ [key]: isEnabled }),
    onMutate: async ({ key, isEnabled }) => {
      await queryClient.cancelQueries({ queryKey: userKeys.myAccount })
      setNotificationSetting(queryClient, key, isEnabled)
    },
    onError: (_error, { key, isEnabled }) => {
      setNotificationSetting(queryClient, key, !isEnabled)
    },
    onSettled: async () => {
      if (isLastPendingChange(queryClient)) {
        await queryClient.invalidateQueries({ queryKey: userKeys.myAccount })
      }
    },
  })
}

// 응답이 조회와 같은 필드라 다시 요청하지 않고 계정 설정 캐시에 바로 반영
function useUpdateProfileMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: async (account) => {
      // 저장 전 값을 담은 진행 중인 조회가 저장 결과를 덮지 않도록 취소
      await queryClient.cancelQueries({ queryKey: userKeys.myAccount })
      queryClient.setQueryData(userKeys.myAccount, account)
      // GNB 프로필 메뉴의 이름 갱신, 저장 완료가 늦어지지 않게 기다리지 않음
      void queryClient.invalidateQueries({ queryKey: userKeys.me, exact: true })
    },
  })
}

function useRequestPhoneChangeMutation() {
  return useMutation({ mutationFn: requestPhoneChange })
}

function useVerifyPhoneChangeMutation() {
  return useMutation({
    mutationFn: ({ phone, code }: { phone: string; code: string }) =>
      verifyPhoneChange(phone, code),
  })
}

function useChangePasswordMutation() {
  return useMutation({ mutationFn: changePassword })
}

export {
  useChangePasswordMutation,
  useMeQuery,
  useMyAccountQuery,
  useRequestPhoneChangeMutation,
  useUpdateNotificationSettingMutation,
  useUpdateProfileMutation,
  useVerifyPhoneChangeMutation,
}
export type { NotificationSettingChange, NotificationSettingKey }
