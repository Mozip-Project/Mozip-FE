'use client'

import { useId, type FocusEvent, type ReactNode } from 'react'
import { Controller, useFormState, type Control, type FieldErrors } from 'react-hook-form'
import type { PostingFileType } from '@/features/posting/schemas/postingFormSchema'
import type { PostingQuestion } from '@/features/posting/types'
import type { ApplicationAnswerValues } from '@/features/recruitment/schemas/applicationAnswerSchema'
import { ActivityAnswerField } from './activityAnswerField'
import { ApplyQuestionCard } from './applyQuestionCard'
import { AvailabilityAnswerField } from './availabilityAnswerField'
import { FileAnswerField } from './fileAnswerField'
import { TextAnswerField } from './textAnswerField'

// Figma "파일당 10MB 이하"
const ANSWER_FILE_MAX_SIZE_BYTES = 10 * 1024 * 1024

// TODO: 운영진 파일 형식별 허용 확장자 확정 후 교체
const ANSWER_FILE_TYPE_META = {
  pdf: { label: 'PDF', mimeTypes: ['application/pdf'] },
  image: { label: 'JPG,PNG', mimeTypes: ['image/jpeg', 'image/png'] },
  ppt: {
    label: 'PPT',
    mimeTypes: [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ],
  },
  mp4: { label: 'MP4', mimeTypes: ['video/mp4'] },
} satisfies Record<PostingFileType, { label: string; mimeTypes: string[] }>

type AnswerGroupProps = {
  onBlur: () => void
  titleId: string
  errorId?: string
  children: ReactNode
}

// 여러 입력으로 된 답변을 문항 제목 그룹으로 묶고, 문항 밖으로 나갈 때 blur 처리
function AnswerGroup({ onBlur, titleId, errorId, children }: AnswerGroupProps) {
  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    // 파일 선택 창, 다른 탭으로 창 포커스가 빠질 때는 문항을 벗어난 것으로 보지 않음
    if (!document.hasFocus()) {
      return
    }
    if (!event.currentTarget.contains(event.relatedTarget)) {
      onBlur()
    }
  }

  return (
    <div
      role="group"
      aria-labelledby={titleId}
      aria-describedby={errorId}
      className="flex flex-col gap-gap-l"
      onBlur={handleBlur}
    >
      {children}
    </div>
  )
}

type QuestionAnswerProps = {
  question: PostingQuestion
  control: Control<ApplicationAnswerValues>
  titleId: string
  errorId: string
}

function QuestionAnswer({ question, control, titleId, errorId }: QuestionAnswerProps) {
  switch (question.type) {
    case 'text':
      return (
        <Controller
          name={`texts.${question.id}`}
          control={control}
          render={({ field, fieldState }) => (
            <TextAnswerField
              {...field}
              maxLength={question.maxLength}
              aria-labelledby={titleId}
              aria-invalid={fieldState.invalid}
              aria-describedby={fieldState.invalid ? errorId : undefined}
            />
          )}
        />
      )
    case 'activity':
      return (
        <Controller
          name={`activities.${question.id}`}
          control={control}
          render={({ field, formState }) => (
            <AnswerGroup onBlur={field.onBlur} titleId={titleId}>
              <ActivityAnswerField
                value={field.value}
                onChange={field.onChange}
                fields={question.activityFields}
                maxCount={question.maxActivityCount}
                getInputError={(index, name) =>
                  formState.errors.activities?.[question.id]?.[index]?.[name]?.message
                }
              />
            </AnswerGroup>
          )}
        />
      )
    case 'file':
      return (
        <Controller
          name={`files.${question.id}`}
          control={control}
          render={({ field, fieldState }) => (
            <AnswerGroup
              onBlur={field.onBlur}
              titleId={titleId}
              errorId={fieldState.invalid ? errorId : undefined}
            >
              <FileAnswerField
                value={field.value}
                onChange={field.onChange}
                acceptsFile={question.acceptsFile}
                acceptsLink={question.acceptsLink}
                fileRule={{
                  acceptedTypes: question.fileTypes.flatMap(
                    (fileType) => ANSWER_FILE_TYPE_META[fileType].mimeTypes,
                  ),
                  maxSizeBytes: ANSWER_FILE_MAX_SIZE_BYTES,
                }}
                fileTypeLabel={question.fileTypes
                  .map((fileType) => ANSWER_FILE_TYPE_META[fileType].label)
                  .join(',')}
              />
            </AnswerGroup>
          )}
        />
      )
    case 'availability':
      return (
        <Controller
          name={`availabilities.${question.id}`}
          control={control}
          render={({ field, fieldState }) => (
            <AnswerGroup
              onBlur={field.onBlur}
              titleId={titleId}
              errorId={fieldState.invalid ? errorId : undefined}
            >
              <AvailabilityAnswerField
                interviewSlots={question.interviewSlots}
                value={field.value}
                onChange={field.onChange}
              />
            </AnswerGroup>
          )}
        />
      )
  }
}

// 장문형·파일·면접 시간 문항 오류는 카드 하단 안내로 표시
function getQuestionErrorMessage(
  errors: FieldErrors<ApplicationAnswerValues>,
  question: PostingQuestion,
) {
  switch (question.type) {
    case 'text':
      return errors.texts?.[question.id]?.message
    case 'activity':
      return undefined
    case 'file':
      return errors.files?.[question.id]?.message
    case 'availability':
      return errors.availabilities?.[question.id]?.message
  }
}

type ApplicationAnswerStepProps = {
  control: Control<ApplicationAnswerValues>
  questions: readonly PostingQuestion[]
}

function ApplicationAnswerStep({ control, questions }: ApplicationAnswerStepProps) {
  const titleIdPrefix = useId()
  const { errors } = useFormState({ control })

  return (
    <div className="flex flex-col gap-gap-l pt-padding-l">
      {questions.map((question, index) => {
        const titleId = `${titleIdPrefix}-${question.id}`
        const errorId = `${titleId}-error`

        return (
          <ApplyQuestionCard
            key={question.id}
            questionNumber={index + 1}
            title={question.title}
            titleId={titleId}
            description={question.description ?? undefined}
            required={question.isRequired}
            hasDivider={question.type !== 'availability'}
            errorMessage={getQuestionErrorMessage(errors, question)}
            errorId={errorId}
          >
            <QuestionAnswer
              question={question}
              control={control}
              titleId={titleId}
              errorId={errorId}
            />
          </ApplyQuestionCard>
        )
      })}
    </div>
  )
}

export { ApplicationAnswerStep }
