'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import CloseIcon from '@/assets/icons/close.svg'
import { Button } from '@/components/ui/Button/button'
import { DialogClose, DialogDescription, DialogTitle } from '@/components/ui/Dialog/dialog'
import { InlineNotice } from '@/components/ui/InlineNotice/inlineNotice'
import { SummaryBar } from '@/components/ui/SummaryBar/summaryBar'
import { useSendNoticeMutation } from '@/features/posting/api/organizer/queries'
import { POSTING_NOTICE_SAMPLE_MESSAGE } from '@/features/posting/mocks/postingNoticeSample'
import {
  postingNoticeSchema,
  type PostingNoticeValues,
} from '@/features/posting/schemas/postingNoticeSchema'
import { getNoticeSendErrorMessage } from '@/features/posting/utils/postingNotice'
import { MessageEditor } from '@/features/recruitment/components/organizer/resultNotice/messageEditor'
import { MessagePreview } from '@/features/recruitment/components/organizer/resultNotice/messagePreview'
import type { ResultNoticeVariable } from '@/features/recruitment/types'
import { ApiError } from '@/lib/apiError'
import { useToast } from '@/providers/toastProvider'

const NOTICE_VARIABLES = ['이름', '공고명'] as const satisfies readonly ResultNoticeVariable[]
// 사람마다 다른 이름은 예시 값으로 미리보기
const PREVIEW_APPLICANT_NAME = '김모집'

const NOTICE_FIELDS = ['subject', 'body'] as const satisfies readonly (keyof PostingNoticeValues)[]

type PostingNoticeFormProps = {
  postingId: string
  postingTitle: string
  organizationName: string
  applicantCount: number
  onSent: () => void
}

function isNoticeField(field: string): field is keyof PostingNoticeValues {
  return NOTICE_FIELDS.some((name) => name === field)
}

function PostingNoticeForm({
  postingId,
  postingTitle,
  organizationName,
  applicantCount,
  onSent,
}: PostingNoticeFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  // isPending은 다시 그린 뒤 반영돼 연속 제출을 놓칠 수 있어 바로 바뀌는 잠금 추가
  const isSendingRef = useRef(false)
  const {
    control,
    setValue,
    setError,
    reset,
    handleSubmit,
    formState: { errors, isSubmitted },
  } = useForm<PostingNoticeValues>({
    resolver: zodResolver(postingNoticeSchema),
    defaultValues: POSTING_NOTICE_SAMPLE_MESSAGE,
  })
  const [subject, body] = useWatch({ control, name: ['subject', 'body'] })
  const { mutate: sendNotice, isPending, error: sendError } = useSendNoticeMutation()
  const { showToast } = useToast()
  // 제목·본문 오류는 입력 칸에 표시, 입력 칸이 없는 필드 오류만 오면 아래 안내
  const hasInputErrors =
    sendError instanceof ApiError && sendError.fieldErrors.some(({ field }) => isNoticeField(field))
  const sendErrorMessage =
    sendError && !hasInputErrors ? getNoticeSendErrorMessage(sendError) : null

  function changeField(name: keyof PostingNoticeValues, value: string) {
    setValue(name, value, { shouldDirty: true, shouldValidate: isSubmitted })
  }

  // 입력 칸을 register하지 않아 shouldFocus 대신, 오류 표시가 반영된 뒤 첫 오류 입력으로 이동
  function focusFirstInvalidField() {
    requestAnimationFrame(() => {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid=true]')?.focus()
    })
  }

  function showServerFieldErrors(error: Error) {
    if (!(error instanceof ApiError)) {
      return
    }
    const noticeFieldErrors = error.fieldErrors.flatMap(({ field, message }) =>
      isNoticeField(field) ? [{ field, message }] : [],
    )
    noticeFieldErrors.forEach(({ field, message }) => {
      setError(field, { type: 'server', message })
    })
    if (noticeFieldErrors.length > 0) {
      focusFirstInvalidField()
    }
  }

  // TODO: 발송 완료 안내 디자인 확인 필요, 지금은 팝업 닫고 토스트
  function handleSend(values: PostingNoticeValues) {
    if (isPending || isSendingRef.current) {
      return
    }
    isSendingRef.current = true
    sendNotice(
      { postingId, ...values },
      {
        onSuccess: () => {
          onSent()
          showToast({ title: '공지를 보냈어요' })
        },
        onError: showServerFieldErrors,
        // 실패 뒤 다시 보낼 수 있도록 성공·실패 모두 해제
        onSettled: () => {
          isSendingRef.current = false
        },
      },
    )
  }

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={(event) => void handleSubmit(handleSend, focusFirstInvalidField)(event)}
      className="flex flex-col gap-5"
    >
      <div className="flex items-center justify-between gap-gap-l">
        <div className="flex min-w-0 flex-col gap-gap-xxs">
          <DialogTitle className="text-headline2 font-semibold text-neutral">
            공지 보내기
          </DialogTitle>
          <DialogDescription className="text-label1 font-normal text-neutral-subtle">
            지원자 모두에게 알림과 메일을 전송합니다.
          </DialogDescription>
        </div>
        <DialogClose asChild>
          <button
            type="button"
            aria-label="닫기"
            className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-xs text-neutral-subtle outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid"
          >
            <CloseIcon aria-hidden className="size-6" />
          </button>
        </DialogClose>
      </div>

      <dl className="flex items-center gap-gap-s rounded-l bg-neutral-weak px-padding-l py-3.5 text-body2">
        <dt className="w-18 shrink-0 font-semibold text-neutral-muted">받는 사람</dt>
        <dd className="flex min-w-0 flex-wrap gap-gap-s">
          <span className="font-medium text-neutral">이 공고 지원자 전체</span>
          <span className="font-semibold text-brand">{applicantCount}명</span>
        </dd>
      </dl>

      {/* Figma 미정의인 좁은 화면은 가로 넘침 방지용 세로 배치 */}
      <div className="flex flex-col gap-gap-l desktop:flex-row">
        <div className="w-full desktop:w-154 desktop:shrink-0">
          <MessageEditor
            title="공지 메시지"
            subject={subject}
            body={body}
            variables={NOTICE_VARIABLES}
            onSubjectChange={(value) => changeField('subject', value)}
            onBodyChange={(value) => changeField('body', value)}
            onReset={() => reset(POSTING_NOTICE_SAMPLE_MESSAGE)}
            subjectError={errors.subject?.message}
            bodyError={errors.body?.message}
          />
        </div>
        {/* 높이는 작성 카드에 맞추고 긴 본문은 미리보기 안에서 스크롤 */}
        <div className="relative min-w-70 desktop:flex-1">
          {/* 동아리명 머리말은 발송 시 자동 추가, 입력란 대신 미리보기에만 표시 */}
          <MessagePreview
            mailPreviewLabel="메일 미리보기"
            organizationName={organizationName}
            message={{ subject: `[${organizationName}] ${subject}`, body }}
            variableValues={{ 이름: PREVIEW_APPLICANT_NAME, 공고명: postingTitle }}
            notificationText="새로운 공지가 도착했어요"
            className="desktop:absolute desktop:inset-0"
          />
        </div>
      </div>

      {sendErrorMessage && (
        <InlineNotice tone="critical" role="alert">
          {sendErrorMessage}
        </InlineNotice>
      )}

      <SummaryBar
        status="ready"
        shouldAnnounce={false}
        actions={
          // 요청 중은 focus 유지를 위해 aria-disabled, 진행 상태는 버튼 문구로 알림
          <Button type="submit" size="m" aria-disabled={isPending}>
            {isPending ? '보내는 중' : `${applicantCount}명에게 보내기`}
          </Button>
        }
      >
        보낸 공지는 취소할 수 없어요. 미리보기로 내용을 확인해 주세요.
      </SummaryBar>
    </form>
  )
}

export { PostingNoticeForm }
