'use client'

import { useId, useRef, type SyntheticEvent } from 'react'
import RefreshIcon from '@/assets/icons/refresh.svg'
import { Button } from '@/components/ui/Button/button'
import { CHIP_SHAPE_CLASS } from '@/components/ui/Chip/chip'
import { TextArea } from '@/components/ui/TextArea/textArea'
import { TextField } from '@/components/ui/TextField/textField'
import { RESULT_NOTICE_BODY_MAX_LENGTH } from '@/features/recruitment/schemas/resultNoticeMessageSchema'
import type { ResultNoticeVariable } from '@/features/recruitment/types'
import { cn } from '@/lib/utils'
import { getTextLength, insertTextAt } from '@/utils/text'

type TextSelection = {
  start: number
  end: number
}

type MessageEditorProps = {
  title: string
  subject: string
  body: string
  variables: readonly ResultNoticeVariable[]
  onSubjectChange: (subject: string) => void
  onBodyChange: (body: string) => void
  onReset: () => void
  // 입력을 벗어날 때 검사
  onSubjectBlur?: () => void
  onBodyBlur?: () => void
  subjectError?: string
  bodyError?: string
}

function MessageEditor({
  title,
  subject,
  body,
  variables,
  onSubjectChange,
  onBodyChange,
  onReset,
  onSubjectBlur,
  onBodyBlur,
  subjectError,
  bodyError,
}: MessageEditorProps) {
  const bodyId = useId()
  const bodyErrorId = useId()
  const variablesLabelId = useId()
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  // 칩을 누르면 focus가 버튼으로 옮겨가 마지막 커서 위치를 따로 보관, null이면 본문 끝
  const lastSelectionRef = useRef<TextSelection | null>(null)

  function handleBodySelect(event: SyntheticEvent<HTMLTextAreaElement>) {
    const { selectionStart, selectionEnd } = event.currentTarget
    lastSelectionRef.current = { start: selectionStart, end: selectionEnd }
  }

  // 초기화로 본문이 바뀌면 예전 커서 위치가 의미 없어 끝에 넣도록 비움
  function handleReset() {
    lastSelectionRef.current = null
    onReset()
  }

  function handleVariableInsert(variable: ResultNoticeVariable) {
    const selection = lastSelectionRef.current ?? { start: body.length, end: body.length }
    const next = insertTextAt(body, `{${variable}}`, selection.start, selection.end)

    // 글자 수 한도를 넘으면 직접 입력과 같이 막음
    if (getTextLength(next.text) > RESULT_NOTICE_BODY_MAX_LENGTH) {
      return
    }

    onBodyChange(next.text)
    lastSelectionRef.current = { start: next.caret, end: next.caret }

    // 값이 반영된 뒤 이어서 입력하도록 넣은 변수 뒤로 커서 이동
    requestAnimationFrame(() => {
      bodyRef.current?.focus()
      bodyRef.current?.setSelectionRange(next.caret, next.caret)
    })
  }

  return (
    <div
      data-slot="message-editor"
      className="flex flex-col gap-gap-l rounded-l border border-neutral-subtle bg-layer-default p-padding-xl"
    >
      <div className="flex items-center gap-gap-s">
        <p className="min-w-0 flex-1 truncate text-headline1 font-semibold text-neutral">{title}</p>
        <Button variant="tertiary" size="s" onClick={handleReset}>
          <RefreshIcon aria-hidden />
          초기화
        </Button>
      </div>

      <TextField
        label="메일 제목"
        required
        placeholder="메일 제목을 입력해 주세요"
        value={subject}
        onChange={(event) => onSubjectChange(event.target.value)}
        onBlur={onSubjectBlur}
        aria-invalid={subjectError ? true : undefined}
        helper={subjectError}
      />

      <div className="flex flex-col gap-gap-xs">
        <label
          htmlFor={bodyId}
          className="flex w-fit items-center gap-gap-xs text-label1 font-medium text-neutral"
        >
          본문
          {/* 필수 여부는 textarea required로 전달 */}
          <span aria-hidden className="text-critical">
            *
          </span>
        </label>
        <TextArea
          ref={bodyRef}
          id={bodyId}
          required
          placeholder="지원자에게 보낼 내용을 입력해 주세요"
          value={body}
          maxLength={RESULT_NOTICE_BODY_MAX_LENGTH}
          onChange={(event) => onBodyChange(event.target.value)}
          onSelect={handleBodySelect}
          onBlur={onBodyBlur}
          aria-invalid={bodyError ? true : undefined}
          aria-describedby={bodyError ? bodyErrorId : undefined}
          // 높이 고정, 넘치면 안쪽 스크롤
          className="h-[158px]"
        />
        {bodyError && (
          <p id={bodyErrorId} className="text-label2 font-normal text-critical">
            {bodyError}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-gap-s">
        <p id={variablesLabelId} className="text-label1 font-medium text-neutral">
          변수 넣기
        </p>
        <ul aria-labelledby={variablesLabelId} className="flex flex-wrap gap-x-gap-s gap-y-gap-xs">
          {variables.map((variable) => (
            <li key={variable}>
              <button
                type="button"
                onClick={() => handleVariableInsert(variable)}
                className={cn(
                  CHIP_SHAPE_CLASS,
                  'cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid',
                )}
              >
                {`{${variable}}`}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export { MessageEditor }
