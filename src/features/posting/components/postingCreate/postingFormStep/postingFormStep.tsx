'use client'

import { useRef, useState, type DragEvent, type MouseEvent, type ReactNode } from 'react'
import { Controller, useFieldArray, useWatch, type Control } from 'react-hook-form'
import ArrowDownIcon from '@/assets/icons/arrowDown.svg'
import ArrowUpIcon from '@/assets/icons/arrowUp.svg'
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
import { useDragAutoScroll } from '@/features/posting/hooks/useDragAutoScroll'
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
import { cn } from '@/lib/utils'
import { getDropIndex } from '@/utils/dropIndex'
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
  const { fields, append, remove, move } = useFieldArray({ control, name, keyName: 'fieldKey' })
  const questions = useWatch({ control, name })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [addedId, setAddedId] = useState<string | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const addBarRef = useRef<HTMLDivElement>(null)
  // 위쪽은 고정된 문항 추가 줄 아래부터 스크롤 구간
  useDragAutoScroll(draggedIndex !== null, addBarRef)
  // 끌어다 놓을 자리. 0은 첫 문항 앞, fields.length는 마지막 문항 뒤
  const [dropIndex, setDropIndex] = useState<number | null>(null)
  const [moveMessage, setMoveMessage] = useState('')
  const listRef = useRef<HTMLOListElement>(null)
  const templateFocusIndexRef = useRef<number | null>(null)
  const selectedIndex = Math.max(
    0,
    fields.findIndex((field) => field.id === selectedId),
  )

  function handleApplyTemplate(templateId: QuestionTemplateId) {
    const templateQuestions = createTemplateQuestions(templateId)
    templateFocusIndexRef.current = fields.length
    append(templateQuestions)
    setSelectedId(templateQuestions[0]?.id ?? null)
  }

  // 아래에 붙은 문항이 화면 밖일 수 있어 메뉴가 닫힐 때 추가된 첫 문항으로 포커스 이동
  function handleTemplateMenuCloseAutoFocus(event: Event) {
    const focusIndex = templateFocusIndexRef.current
    templateFocusIndexRef.current = null
    const firstAddedCard = focusIndex === null ? null : getCardButton(focusIndex)
    if (firstAddedCard) {
      event.preventDefault()
      firstAddedCard.focus()
    }
  }

  function getCardButton(index: number) {
    return listRef.current?.children.item(index)?.querySelector<HTMLElement>('[aria-pressed]')
  }

  function moveQuestion(fromIndex: number, toIndex: number) {
    if (toIndex === fromIndex || toIndex < 0 || toIndex >= fields.length) {
      return
    }
    // 처음엔 선택 ID 없이 첫 문항을 선택으로 보므로, 옮긴 뒤에도 같은 문항이 선택되게 고정
    setSelectedId(fields[selectedIndex]?.id ?? null)
    move(fromIndex, toIndex)
    setMoveMessage(`Q${fromIndex + 1} 문항을 Q${toIndex + 1} 자리로 옮겼어요`)
  }

  function handleDragStart(event: DragEvent<HTMLDivElement>, index: number) {
    event.dataTransfer.effectAllowed = 'move'
    // Firefox는 전달 데이터가 있어야 드래그 시작
    event.dataTransfer.setData('text/plain', '')
    setDraggedIndex(index)
  }

  // 문항 사이 간격·오른쪽 여백에서도 포인터 높이로 놓을 자리를 다시 계산
  function handleDragOverList(event: DragEvent<HTMLOListElement>) {
    if (draggedIndex === null) {
      return
    }
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    const itemCenters = Array.from(listRef.current?.children ?? [], (item) => {
      const { top, height } = item.getBoundingClientRect()
      return top + height / 2
    })
    setDropIndex(getDropIndex(itemCenters, event.clientY))
  }

  // 설정 패널 입력칸에 글자를 끌어다 놓는 기본 동작은 유지
  function handleDrop(event: DragEvent<HTMLOListElement>) {
    if (draggedIndex === null) {
      return
    }
    event.preventDefault()
    if (dropIndex !== null) {
      // 뒤로 옮기면 빠진 자기 자리만큼 한 칸 앞
      moveQuestion(draggedIndex, dropIndex > draggedIndex ? dropIndex - 1 : dropIndex)
    }
    handleDragEnd()
  }

  function handleDragEnd() {
    setDraggedIndex(null)
    setDropIndex(null)
  }

  // 제자리에 놓는 위치는 표시 안 함
  function isDropTarget(position: number) {
    return (
      draggedIndex !== null &&
      dropIndex === position &&
      position !== draggedIndex &&
      position !== draggedIndex + 1
    )
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
      {/* 공고 작성 고정 바(제목·단계 줄) 바로 아래에 이어서 고정 */}
      <div
        ref={addBarRef}
        className="sticky-below-gnb z-10 flex items-end justify-between border-b border-neutral-subtle bg-layer-default [--sticky-offset:var(--sticky-top-bar-height)]"
      >
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
            <DropdownMenuTrigger
              data-track-target="question_template_open"
              className="flex cursor-pointer items-center gap-1.5 rounded-m px-2.5 py-padding-xs text-label2 font-semibold text-brand outline-none focus-visible:outline-2 focus-visible:outline-focus-ring focus-visible:outline-solid"
            >
              템플릿으로 추가
              <ChevronDownIcon aria-hidden className="size-4 shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={TEMPLATE_MENU_OFFSET_PX}
              onCloseAutoFocus={handleTemplateMenuCloseAutoFocus}
              className="flex w-50 flex-col gap-gap-xxs rounded-m border-neutral-muted bg-layer-default p-padding-xs"
            >
              {QUESTION_TEMPLATE_IDS.map((templateId) => (
                <DropdownMenuItem
                  key={templateId}
                  onSelect={() => handleApplyTemplate(templateId)}
                  data-track-target="question_template_select"
                >
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
          ref={listRef}
          aria-label="지원서 문항"
          onDragOver={handleDragOverList}
          onDrop={handleDrop}
          className="flex flex-col gap-gap-l pr-[calc(--spacing(100)+var(--spacing-gap-xl))]"
        >
          {fields.map((field, index) => {
            const question = questions[index] ?? field
            const isSelected = index === selectedIndex
            const isLast = index === fields.length - 1

            return (
              <li key={field.fieldKey} className="relative">
                {isDropTarget(index) && <DropIndicator position="before" />}
                {/* 설정 패널 입력의 글자 선택을 막지 않도록 카드만 드래그 대상 */}
                <div
                  draggable
                  onDragStart={(event) => handleDragStart(event, index)}
                  onDragEnd={handleDragEnd}
                >
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
                          {/* 드래그를 못 쓰는 키보드 사용자용 순서 변경 */}
                          <DropdownMenuItem
                            disabled={index === 0}
                            onSelect={() => moveQuestion(index, index - 1)}
                          >
                            <ArrowUpIcon aria-hidden />
                            위로 이동
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={isLast}
                            onSelect={() => moveQuestion(index, index + 1)}
                          >
                            <ArrowDownIcon aria-hidden />
                            아래로 이동
                          </DropdownMenuItem>
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
                </div>
                {isLast && isDropTarget(fields.length) && <DropIndicator position="after" />}
                {isSelected && (
                  // 목록보다 길어진 패널이 화면 끝에 붙지 않도록 페이지 아래 여백만큼 확보
                  <div className="absolute top-0 left-[calc(100%+var(--spacing-gap-xl))] pb-(--page-padding-bottom)">
                    <PostingQuestionSettings
                      key={field.id}
                      control={control}
                      setIndex={setIndex}
                      questionIndex={index}
                      type={question.type}
                      shouldFocusTitle={field.id === addedId}
                    />
                  </div>
                )}
              </li>
            )
          })}
        </ol>
        <p role="status" className="sr-only">
          {moveMessage}
        </p>
      </div>
    </div>
  )
}

// 문항 사이 간격 가운데에 놓일 자리 표시
function DropIndicator({ position }: { position: 'before' | 'after' }) {
  return (
    <span
      aria-hidden
      className={cn(
        'absolute inset-x-0 h-0.5 rounded-full bg-brand-solid',
        position === 'before'
          ? '-top-[calc(var(--spacing-gap-l)/2+1px)]'
          : '-bottom-[calc(var(--spacing-gap-l)/2+1px)]',
      )}
    />
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
