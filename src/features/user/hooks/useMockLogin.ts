import { useQueryClient } from '@tanstack/react-query'
import { userKeys } from '@/features/user/api/keys'
import { setMockLoggedIn } from '@/features/user/mocks/mockLogin'
import { useToast } from '@/providers/toastProvider'

// TODO: 로그인 화면 API 연결 후 삭제, MSW의 me 응답만 성공으로 전환
function useMockLogin() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return async function loginAsMockUser() {
    setMockLoggedIn(true)
    await queryClient.invalidateQueries({ queryKey: userKeys.me })

    // MSW가 꺼져 있으면 me가 그대로 실패하므로 성공했을 때만 안내
    if (queryClient.getQueryState(userKeys.me)?.status === 'success') {
      showToast({ title: '로그인했어요' })
    }
  }
}

export { useMockLogin }
