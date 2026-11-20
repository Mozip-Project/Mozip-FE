'use client'

import { useState, type MouseEvent, type ReactNode } from 'react'
import { Controller, useFieldArray, useWatch, type Control } from 'react-hook-form'
import ChevronDownIcon from '@/assets/icons/chevronDown.svg'
import InfoIcon from '@/assets/icons/info.svg'
import TrashIcon from '@/assets/icons/trash.svg'
import { ActionMenu } from '@/components/ui/ActionMenu/actionMenu'
import { Checkbox } from '@/components/ui/Checkbox/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu/dropdownMenu'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs/tabs'
import { Tooltip } from '@/components/ui/Tooltip/tooltip'
import type { PostingCreateValues } from '@/features/posting/schemas/postingCreateValues'
import {
  QUESTION_TYPES,
  type PostingFileType,
  type PostingQuestion,
} from '@/features/posting/schemas/postingFormSchema'
import { createQuestion } from '@/features/posting/utils/postingQuestions'
import {
  createTemplateQuestions,
  QUESTION_TEMPLATE_IDS,
  QUESTION_TEMPLATE_LABEL,
  type QuestionTemplateId,
} from '@/features/posting/utils/postingQuestionTemplates'
import { ActivityAnswerPreview } from './activityAnswerPreview'
import { FileAnswerPreview } from './fileAnswerPreview'
import { PostingQuestionSettings } from './postingQuestionSettings'
import { FILE_TYPE_LABEL, QUESTION_TYPE_META } from './postingQuestionTypes'
import { QuestionCard } from './questionCard'
import { TextAnswerPreview } from './textAnswerPreview'

const FILE_PREVIEW_MAX_SIZE_BYTES = 10 * 1024 * 1024
const PROFILE_TOOLTIP_OFFSET_PX = 3
const QUESTION_MENU_OFFSET_PX = 6
const TEMPLATE_MENU_OFFSET_PX = 14
const EMPTY_TITLE_TEXT = '질문을 작성해 주세요'

type PostingFormStepProps = {
  control: Control<PostingCreateValues>
  positionNames: string[]
}

function PostingFormStep({ control, positionNames }: PostingFormStepProps) {
  const [activeSetIndex, setActiveSetIndex] = useState(0)
  const hasPositionTabs = positionNames.length > 0

  const tabs = hasPositionTabs && (
    <Tabs
      value={String(activeSetIndex)}
      onValueChange={(value) => setActiveSetIndex(Number(value))}
      className="self-stretch"
    >
      <TabsList aria-label="모집 포지션" className="h-full gap-gap-s">
        {positionNames.map((positionName, index) => (
          <TabsTrigger key={`${positionName}-${index}`} value={String(index)}>
            {positionName}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )

  return (
    <QuestionBuilder
      key={activeSetIndex}
      control={control}
      setIndex={activeSetIndex}
      tabs={tabs}
      profilePhotoField={
        <Controller
          name="requiresProfilePhoto"
          control={control}
          render={({ field }) => (
            <div className="flex items-center gap-gap-xxs">
              <Checkbox
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              >
                지원자 프로필 사진을 필수로 받기
              </Checkbox>
              <ProfilePhotoInfo />
            </div>
          )}
        />
      }
    />
  )
}

// hover 외 클릭·터치로도 안내 노출
function ProfilePhotoInfo() {
  const [isOpen, setIsOpen] = useState(false)

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    // Radix 트리거의 클릭 닫힘 방지
    event.preventDefault()
    setIsOpen(true)
  }

  return (
    <Tooltip
      label="사진이 없는 지원자는 업로드 후 지원할 수 있어요"
      side="bottom"
      sideOffset={PROFILE_TOOLTIP_OFFSET_PX}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <button
        type="button"
        aria-label="프로필 사진 필수 안내"
        onClick={handleClick}
        className="flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full text-neutral-subtle outline-none focus-visible:outline-2 focus-visible:outline-focus-ring focus-visible:outline-solid"
      >
        <InfoIcon aria-hidden className="size-4" />
      </button>
    </Tooltip>
  )
}

type QuestionBuilderProps = {
  control: Control<PostingCreateValues>
  setIndex: number
  tabs: ReactNode
  profilePhotoField: ReactNode
}

function QuestionBuilder({ control, setIndex, tabs, profilePhotoField }: QuestionBuilderProps) {
  const name = `questionSets.${setIndex}.questions` as const
  const { fields, append, remove, replace } = useFieldArray({ control, name, keyName: 'fieldKey' })
  const questions = useWatch({ control, name })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [addedId, setAddedId] = useState<string | null>(null)
  const selectedIndex = Math.max(
    0,
    fields.findIndex((field) => field.id === selectedId),
  )

  function handleApplyTemplate(templateId: QuestionTemplateId) {
    const templateQuestions = createTemplateQuestions(templateId)
    replace(templateQuestions)
    setSelectedId(templateQuestions[0]?.id ?? null)
  }

  function handleAdd(type: PostingQuestion['type']) {
    const question = createQuestion(type)
    append(question)
    setSelectedId(question.id)
    setAddedId(question.id)
  }

  function handleSelect(questionId: string) {
    setSelectedId(questionId)
    setAddedId(null)
  }

  return (
    <div className="flex flex-col gap-gap-xl">
      <div className="flex items-end justify-between border-b border-neutral-subtle">
        {tabs || <span />}
        <div className="flex items-center gap-gap-xs pb-1.5">
          <div className="flex items-center gap-gap-xxs">
            {QUESTION_TYPES.map((type) => {
              const { label, Icon } = QUESTION_TYPE_META[type]

              return (
                <button
                  key={type}
                  type="button"
                  aria-label={`${label} 문항 추가`}
                  onClick={() => handleAdd(type)}
                  className="flex cursor-pointer items-center gap-1.5 rounded-m px-padding-s py-padding-xs text-label2 font-semibold text-neutral outline-none focus-visible:outline-2 focus-visible:outline-focus-ring focus-visible:outline-solid"
                >
                  <Icon aria-hidden className="size-4 shrink-0 text-neutral-muted" />
                  {label}
                </button>
              )
            })}
          </div>
          <span aria-hidden className="h-4 w-px bg-(--border-color-neutral-weak)" />
          <DropdownMenu>
            <DropdownMenuTrigger className="flex cursor-pointer items-center gap-1.5 rounded-m px-2.5 py-padding-xs text-label2 font-semibold text-brand outline-none focus-visible:outline-2 focus-visible:outline-focus-ring focus-visible:outline-solid">
              탬플릿으로 추가
              <ChevronDownIcon aria-hidden className="size-4 shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={TEMPLATE_MENU_OFFSET_PX}
              className="flex w-50 flex-col gap-gap-xxs rounded-m border-neutral-muted bg-layer-default p-padding-xs"
            >
              {QUESTION_TEMPLATE_IDS.map((templateId) => (
                <DropdownMenuItem key={templateId} onSelect={() => handleApplyTemplate(templateId)}>
                  {QUESTION_TEMPLATE_LABEL[templateId]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex flex-col gap-gap-l">
        {profilePhotoField}
        {/* 설정 패널은 선택한 카드 높이에 맞춰 오른쪽 여백에 배치 */}
        <ol
          aria-label="지원서 문항"
          className="flex flex-col gap-gap-l pr-[calc(--spacing(100)+var(--spacing-gap-xl))]"
        >
          {fields.map((field, index) => {
            const question = questions[index] ?? field
            const isSelected = index === selectedIndex

            return (
              <li key={field.fieldKey} className="relative">
                <QuestionCard
                  index={index + 1}
                  title={question.title.trim() || EMPTY_TITLE_TEXT}
                  description={question.description.trim() || undefined}
                  required={question.isRequired}
                  isSelected={isSelected}
                  onSelect={() => handleSelect(field.id)}
                  actions={
                    isSelected && (
                      <ActionMenu
                        label={`Q${index + 1} 문항 메뉴`}
                        sideOffset={QUESTION_MENU_OFFSET_PX}
                      >
                        <DropdownMenuItem onSelect={() => remove(index)}>
                          <TrashIcon aria-hidden />
                          질문 삭제
                        </DropdownMenuItem>
                      </ActionMenu>
                    )
                  }
                >
                  <QuestionAnswerPreview question={question} />
                </QuestionCard>
                {isSelected && (
                  <PostingQuestionSettings
                    key={field.id}
                    control={control}
                    setIndex={setIndex}
                    questionIndex={index}
                    type={question.type}
                    shouldFocusTitle={field.id === addedId}
                    className="absolute top-0 left-[calc(100%+var(--spacing-gap-xl))]"
                  />
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}

function QuestionAnswerPreview({ question }: { question: PostingQuestion }) {
  switch (question.type) {
    case 'text':
      return <TextAnswerPreview maxLength={Number(question.maxLength) || 0} />
    case 'activity':
      return <ActivityAnswerPreview fields={question.activityFields} />
    case 'file':
      return (
        <FileAnswerPreview
          acceptedTypes={[]}
          maxSizeBytes={FILE_PREVIEW_MAX_SIZE_BYTES}
          fileDescription="10MB 이하"
          guide={getFileTypeGuide(question.fileTypes)}
          hasFileUpload={question.acceptsFile}
          hasLinkInput={question.acceptsLink}
        />
      )
  }
}

function getFileTypeGuide(fileTypes: PostingFileType[]) {
  if (fileTypes.length === 0) {
    return undefined
  }
  return `${fileTypes.map((fileType) => FILE_TYPE_LABEL[fileType]).join(', ')}만 업로드 가능합니다`
}

export { PostingFormStep }
