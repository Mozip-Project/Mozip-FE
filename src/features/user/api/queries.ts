import { useQuery } from '@tanstack/react-query'
import { getMe } from './api'
import { userKeys } from './keys'

function useMeQuery() {
  return useQuery({
    queryKey: userKeys.me,
    queryFn: getMe,
  })
}

export { useMeQuery }
