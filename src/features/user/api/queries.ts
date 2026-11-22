import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import type { MyAccountFieldsFragment } from '@/gql/graphql'
import { getMe, getMyAccount, updateNotificationSettings } from './api'
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

export { useMeQuery, useMyAccountQuery, useUpdateNotificationSettingMutation }
export type { NotificationSettingChange, NotificationSettingKey }
