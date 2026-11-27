import { useEffect, useEffectEvent, useRef } from 'react'
import { useSaveResultMessageMutation } from '@/features/recruitment/api/organizer/queries'
import {
  resultNoticeMessageSchema,
  type ResultNoticeFormValues,
} from '@/features/recruitment/schemas/resultNoticeMessageSchema'
import {
  MESSAGE_ALREADY_SENT_CODE,
  RESULT_NOTICE_TARGETS,
  type ResultNoticeTarget,
} from '@/features/recruitment/types'
import type { MessageStatus } from '@/gql/graphql'
import { useAutoSave } from '@/hooks/useAutoSave'
import { ApiError } from '@/lib/apiError'
import { isOneOf } from '@/utils/isOneOf'
import type { UseFormReturn } from 'react-hook-form'

// TODO: 자동 저장 간격 확인, 임시 값
const AUTO_SAVE_DELAY_MS = 3000

type UseResultNoticeMessageSaveOptions = {
  postingId: string
  form: UseFormReturn<ResultNoticeFormValues>
  // 저장한 적 없으면 null
  messageStatuses: Record<ResultNoticeTarget, MessageStatus | null>
}

// 대상별 초안 자동 저장
function useResultNoticeMessageSave({
  postingId,
  form,
  messageStatuses,
}: UseResultNoticeMessageSaveOptions) {
  const { mutateAsync: saveMessage } = useSaveResultMessageMutation(postingId)
  // 저장할 대상
  const unsavedTargetsRef = useRef(new Set<ResultNoticeTarget>())

  // 발송 시작·빈 칸이면 건너뜀, 실패하면 다음에 다시 저장
  async function saveUnsavedTargets() {
    const targets = [...unsavedTargetsRef.current]
    unsavedTargetsRef.current.clear()

    await Promise.all(
      targets.map(async (target) => {
        const status = messageStatuses[target]
        const message = form.getValues(target)
        if (
          (status && status !== 'DRAFT') ||
          !resultNoticeMessageSchema.safeParse(message).success
        ) {
          return
        }

        try {
          await saveMessage({ postingId, target, ...message })
        } catch (error) {
          // 이미 발송한 메시지는 고칠 수 없어 다시 저장하지 않음
          if (!(error instanceof ApiError && error.code === MESSAGE_ALREADY_SENT_CODE)) {
            unsavedTargetsRef.current.add(target)
          }
        }
      }),
    )
  }

  const { scheduleSave, cancelScheduledSave, waitForSave } = useAutoSave(
    AUTO_SAVE_DELAY_MS,
    saveUnsavedTargets,
  )

  // 입력을 멈추면 저장
  const handleFormChange = useEffectEvent((name: string | undefined) => {
    const [target] = name?.split('.') ?? []
    if (!target || !isOneOf(RESULT_NOTICE_TARGETS, target)) {
      return
    }
    unsavedTargetsRef.current.add(target)
    scheduleSave()
  })
  const { subscribe } = form

  useEffect(
    () =>
      subscribe({ formState: { values: true }, callback: ({ name }) => handleFormChange(name) }),
    [subscribe],
  )

  const saveOnLeave = useEffectEvent(() => {
    if (unsavedTargetsRef.current.size > 0) {
      void saveUnsavedTargets()
    }
  })
  useEffect(() => () => saveOnLeave(), [])

  async function flushSave() {
    cancelScheduledSave()
    await waitForSave()
    await saveUnsavedTargets()
    return unsavedTargetsRef.current.size === 0
  }

  return { flushSave }
}

export { useResultNoticeMessageSave }
