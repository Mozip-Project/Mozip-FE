'use client'

import { useEffect, useId, useRef, useState, type RefObject } from 'react'
import { flushSync } from 'react-dom'
import { useController, useWatch, type Control } from 'react-hook-form'
import CalendarIcon from '@/assets/icons/calendar.svg'
import { Button } from '@/components/ui/Button/button'
import { InlineNotice } from '@/components/ui/InlineNotice/inlineNotice'
import type { PostingCreateValues } from '@/features/posting/schemas/postingCreateValues'
import {
  INTERVIEW_APPLICANT_COUNTS,
  INTERVIEW_BREAKS,
  INTERVIEW_DURATIONS,
  INTERVIEW_ROOM_COUNTS,
  MAX_INTERVIEW_DAYS,
} from '@/features/posting/schemas/postingInterviewSchema'
import { getInterviewPeriod } from '@/features/posting/utils/interviewPeriod'
import { getSlotDate } from '@/features/posting/utils/interviewTimetable'
import { cn } from '@/lib/utils'
import { useToast } from '@/providers/toastProvider'
import { formatMonthDayWithWeekday } from '@/utils/date'
import { InterviewDateStrip } from './interviewDateStrip'
import { InterviewTimetable } from './interviewTimetable'
import { SelectField } from '../fields/selectField'

function toUnitOptions<TValue extends string>(values: readonly TValue[], unit: string) {
  return values.map((value) => ({ value, label: `${value}${unit}` }))
}

const DURATION_OPTIONS = toUnitOptions(INTERVIEW_DURATIONS, '분')
const BREAK_OPTIONS = toUnitOptions(INTERVIEW_BREAKS, '분')
const APPLICANT_OPTIONS = toUnitOptions(INTERVIEW_APPLICANT_COUNTS, '명')
const ROOM_OPTIONS = toUnitOptions(INTERVIEW_ROOM_COUNTS, '개')

type InterviewControl = Control<PostingCreateValues>

type DateMode = 'select' | 'edit' | 'done'

function PostingInterviewStep({ control }: { control: InterviewControl }) {
  const scheduleTitleId = useId()
  const { field: durationField } = useController({ control, name: 'interviewDuration' })
  const { field: breakField } = useController({ control, name: 'interviewBreak' })
  const { field: datesField } = useController({ control, name: 'interviewDates' })
  const { field: slotsField } = useController({ control, name: 'interviewSlots' })
  // 날짜를 이미 고른 상태로 돌아오면 시간 선택부터 표시
  const [dateMode, setDateMode] = useState<DateMode>(() =>
    datesField.value.length === 0 ? 'select' : 'done',
  )
  // 완료 전까지 고른 날짜는 임시로 두고, 취소하면 이전 날짜 유지
  const [draftDates, setDraftDates] = useState(datesField.value)
  const timetableTitleRef = useRef<HTMLHeadingElement>(null)
  const dateGroupRef = useRef<HTMLDivElement>(null)
  const isDateSectionOpen = dateMode !== 'done'
  const hasDraftChanged = draftDates.join() !== datesField.value.join()

  function handleToggleDraftDate(date: string) {
    setDraftDates(
      draftDates.includes(date)
        ? draftDates.filter((draftDate) => draftDate !== date)
        : [...draftDates, date].sort(),
    )
  }

  function closeDateSection() {
    flushSync(() => setDateMode('done'))
    timetableTitleRef.current?.focus()
  }

  function handleCompleteDates() {
    datesField.onChange(draftDates)
    slotsField.onChange(slotsField.value.filter((slot) => draftDates.includes(getSlotDate(slot))))
    closeDateSection()
  }

  function handleCancelEdit() {
    setDraftDates(datesField.value)
    closeDateSection()
  }

  function handleEditDates() {
    setDraftDates(datesField.value)
    flushSync(() => setDateMode('edit'))
    dateGroupRef.current?.focus()
  }

  return (
    <div className="flex flex-col gap-10 pt-padding-l">
      <section aria-labelledby={scheduleTitleId} className="flex flex-col items-end gap-gap-xl">
        <h2 id={scheduleTitleId} className="w-full text-heading2 font-semibold text-neutral">
          면접 일정
        </h2>
        <div className="flex w-full flex-col gap-gap-xl">
          <div className="flex gap-gap-xl">
            <SelectField
              className="min-w-0 flex-1"
              label="면접 1회 시간"
              required
              options={DURATION_OPTIONS}
              value={durationField.value}
              onValueChange={durationField.onChange}
              placeholder="30분"
            />
            <SelectField
              className="min-w-0 flex-1"
              label="쉬는 시간"
              required
              options={BREAK_OPTIONS}
              value={breakField.value}
              onValueChange={breakField.onChange}
              placeholder="0분"
            />
          </div>
          {isDateSectionOpen && (
            <InterviewDateField
              control={control}
              groupRef={dateGroupRef}
              selectedDates={draftDates}
              onToggle={handleToggleDraftDate}
            />
          )}
        </div>
        {dateMode === 'select' && (
          <Button size="s" disabled={draftDates.length === 0} onClick={handleCompleteDates}>
            선택 완료
          </Button>
        )}
        {dateMode === 'edit' && (
          <div className="flex gap-gap-s">
            <Button variant="secondary" size="s" onClick={handleCancelEdit}>
              취소
            </Button>
            <Button
              size="s"
              disabled={!hasDraftChanged || draftDates.length === 0}
              onClick={handleCompleteDates}
            >
              수정 완료
            </Button>
          </div>
        )}
      </section>
      {dateMode !== 'select' && (
        // 날짜 수정 중에는 이전 날짜 기준 시간표를 흐리게 보여 주고 조작 차단
        <div inert={dateMode === 'edit'} className={cn(dateMode === 'edit' && 'opacity-40')}>
          <InterviewTimeSection
            control={control}
            titleRef={timetableTitleRef}
            onEditDates={handleEditDates}
          />
        </div>
      )}
      {dateMode === 'done' && <InterviewConditionSection control={control} />}
    </div>
  )
}

type InterviewTimeSectionProps = {
  control: InterviewControl
  titleRef: RefObject<HTMLHeadingElement | null>
  onEditDates: () => void
}

function InterviewTimeSection({ control, titleRef, onEditDates }: InterviewTimeSectionProps) {
  const titleId = useId()
  const [interviewDates, interviewDuration, interviewBreak] = useWatch({
    control,
    name: ['interviewDates', 'interviewDuration', 'interviewBreak'],
  })
  const { field } = useController({ control, name: 'interviewSlots' })

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-gap-xl">
      <div className="flex items-center justify-between gap-gap-m">
        <div className="flex flex-col gap-0.5">
          <h2
            ref={titleRef}
            id={titleId}
            tabIndex={-1}
            className="text-heading2 font-semibold text-neutral outline-none"
          >
            면접 가능 시간
          </h2>
          <p className="text-label2 font-normal text-neutral-subtle">
            칸을 드래그해서 면접 볼 시간을 선택해 주세요
          </p>
        </div>
        <Button variant="secondary" size="s" onClick={onEditDates}>
          <CalendarIcon aria-hidden />
          날짜 수정
        </Button>
      </div>
      <InterviewTimetable
        dates={interviewDates}
        selectedSlots={field.value}
        onSelectedSlotsChange={field.onChange}
        durationMinutes={interviewDuration ? Number(interviewDuration) : null}
        breakMinutes={interviewBreak ? Number(interviewBreak) : null}
      />
    </section>
  )
}

function InterviewConditionSection({ control }: { control: InterviewControl }) {
  const titleId = useId()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuSpaceRef = useRef<HTMLDivElement>(null)

  const isPointerPressedRef = useRef(false)

  // 페이지 끝이라 아래 공간이 부족해도 메뉴를 아래로 열도록 여백을 붙이고 스크롤
  useEffect(() => {
    if (!isMenuOpen) {
      return
    }

    function scrollToMenuSpace() {
      isPointerPressedRef.current = false
      menuSpaceRef.current?.scrollIntoView({ block: 'end' })
    }

    // 누른 채 스크롤하면 손을 뗄 때 커서 아래 항목이 선택돼 뗀 뒤에 이동
    if (!isPointerPressedRef.current) {
      scrollToMenuSpace()
      return
    }
    window.addEventListener('pointerup', scrollToMenuSpace, { once: true })
    return () => window.removeEventListener('pointerup', scrollToMenuSpace)
  }, [isMenuOpen])

  const { field: applicantField } = useController({ control, name: 'interviewApplicantCount' })
  const { field: roomField } = useController({ control, name: 'interviewRoomCount' })

  return (
    <section
      aria-labelledby={titleId}
      onPointerDown={() => {
        isPointerPressedRef.current = true
      }}
      className="flex flex-col gap-gap-xl"
    >
      <h2 id={titleId} className="text-heading2 font-semibold text-neutral">
        면접 조건
      </h2>
      <div className="flex gap-gap-xl">
        <SelectField
          className="min-w-0 flex-1"
          label="면접당 최대 지원자 수"
          required
          options={APPLICANT_OPTIONS}
          value={applicantField.value}
          onValueChange={applicantField.onChange}
          placeholder="1명 (그룹 면접이면 2~5명)"
          menuSide="bottom"
          onOpenChange={setIsMenuOpen}
        />
        <SelectField
          className="min-w-0 flex-1"
          label="같은 시간 면접실 수"
          required
          options={ROOM_OPTIONS}
          value={roomField.value}
          onValueChange={roomField.onChange}
          placeholder="2개"
          menuSide="bottom"
          onOpenChange={setIsMenuOpen}
        />
      </div>
      {isMenuOpen && <div ref={menuSpaceRef} aria-hidden className="-mt-gap-xl h-60" />}
    </section>
  )
}

type InterviewDateFieldProps = {
  control: InterviewControl
  groupRef: RefObject<HTMLDivElement | null>
  selectedDates: string[]
  onToggle: (date: string) => void
}

function InterviewDateField({
  control,
  groupRef,
  selectedDates,
  onToggle,
}: InterviewDateFieldProps) {
  const labelId = useId()
  const { showToast } = useToast()
  const [documentResultDate, finalResultDate] = useWatch({
    control,
    name: ['documentResultDate', 'finalResultDate'],
  })

  if (!documentResultDate || !finalResultDate) {
    return null
  }

  const period = getInterviewPeriod(documentResultDate, finalResultDate)

  return (
    <div
      ref={groupRef}
      role="group"
      aria-labelledby={labelId}
      tabIndex={-1}
      className="flex flex-col gap-gap-s outline-none"
    >
      <p className="flex items-center gap-gap-s text-label1">
        <span id={labelId} className="font-semibold text-neutral">
          면접 날짜
        </span>
        <span>
          <span className="font-semibold text-brand">{selectedDates.length}</span>
          <span className="font-normal text-neutral-subtle"> / {MAX_INTERVIEW_DAYS}일</span>
        </span>
      </p>
      {period && (
        <InlineNotice
          tone="warning"
          title={`면접 가능 기간: ${formatMonthDayWithWeekday(period.startDate)} ~ ${formatMonthDayWithWeekday(period.endDate)}`}
        >
          서류 결과 발표일 다음 날부터 최종 결과 발표일 전날까지 면접을 잡을 수 있어요
        </InlineNotice>
      )}
      <InterviewDateStrip
        documentResultDate={documentResultDate}
        finalResultDate={finalResultDate}
        days={period?.days ?? []}
        selectedDates={selectedDates}
        maxSelectable={MAX_INTERVIEW_DAYS}
        onToggle={onToggle}
        onLimitExceeded={() =>
          showToast({
            title: `면접 날짜는 최대 ${MAX_INTERVIEW_DAYS}개까지 선택할 수 있어요`,
            icon: 'info',
          })
        }
      />
    </div>
  )
}

export { PostingInterviewStep }
