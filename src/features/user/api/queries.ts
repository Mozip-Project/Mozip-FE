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

// 연달아 누른 토글이 있으면 마지막 요청이 끝날 때만 서버 값으로 맞춰 앞선 응답의 덮어쓰기 방지
function isLastPendingChange(queryClient: QueryClient) {
  return queryClient.isMutating({ mutationKey: userMutationKeys.updateNotificationSettings }) === 1
}

// 토글 하나씩 낙관적으로 반영하고, 실패하면 그 토글만 되돌림
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
    onSuccess: (account) => {
      if (isLastPendingChange(queryClient)) {
        queryClient.setQueryData(userKeys.myAccount, account)
      }
    },
    onError: async (_error, { key, isEnabled }) => {
      setNotificationSetting(queryClient, key, !isEnabled)
      if (isLastPendingChange(queryClient)) {
        await queryClient.invalidateQueries({ queryKey: userKeys.myAccount })
      }
    },
  })
}

export { useMeQuery, useMyAccountQuery, useUpdateNotificationSettingMutation }
export type { NotificationSettingChange, NotificationSettingKey }
