import { useMutation } from '@tanstack/react-query'
import { reportPosting } from './api'

function useReportPostingMutation() {
  return useMutation({ mutationFn: reportPosting })
}

export { useReportPostingMutation }
