import { useEffect, useRef, useState } from 'react'
import ChevronLeftIcon from '@/assets/icons/chevronLeft.svg'
import CloseIcon from '@/assets/icons/close.svg'
import PlusIcon from '@/assets/icons/plus.svg'
import { Avatar } from '@/components/ui/Avatar/avatar'
import { Badge } from '@/components/ui/Badge/badge'
import type { TimetableApplicant, TimetableInterviewer } from '@/features/recruitment/types'
import { cn } from '@/lib/utils'
import { FOCUS_RING_CLASS } from './timetableStyles'

type InterviewerOption = {
  interviewer: TimetableInterviewer
  // 같은 시간 다른 면접에 있어 고를 수 없는 이유
  busyReason: string | null
}

type InterviewerPopoverContentProps = {
  applicants: TimetableApplicant[]
  interviewers: TimetableInterviewer[]
  options: InterviewerOption[]
  onInterviewersChange: (interviewerIds: string[]) => void
}

function InterviewerPopoverContent({
  applicants,
  interviewers,
  options,
  onInterviewersChange,
}: InterviewerPopoverContentProps) {
  const [isAdding, setIsAdding] = useState(false)
  const interviewerIds = interviewers.map(({ id }) => id)

  if (isAdding) {
    return (
      <InterviewerAddList
        options={options}
        onBack={() => setIsAdding(false)}
        onSelect={(interviewerId) => {
          onInterviewersChange([...interviewerIds, interviewerId])
          setIsAdding(false)
        }}
      />
    )
  }

  return (
    <InterviewerList
      applicants={applicants}
      interviewers={interviewers}
      onAdd={() => setIsAdding(true)}
      onRemove={(interviewerId) =>
        onInterviewersChange(interviewerIds.filter((id) => id !== interviewerId))
      }
    />
  )
}

type InterviewerListProps = {
  applicants: TimetableApplicant[]
  interviewers: TimetableInterviewer[]
  onAdd: () => void
  onRemove: (interviewerId: string) => void
}

function InterviewerList({ applicants, interviewers, onAdd, onRemove }: InterviewerListProps) {
  const addButtonRef = useRef<HTMLButtonElement>(null)

  // 추가 화면에서 돌아오면 추가 버튼으로 focus 복귀
  useEffect(() => {
    if (document.activeElement === document.body) {
      addButtonRef.current?.focus()
    }
  }, [])

  return (
    <div className="flex flex-col gap-gap-l">
      <div className="flex flex-wrap items-center gap-x-gap-m gap-y-gap-xs">
        {applicants.map((applicant) => (
          <span key={applicant.id} className="flex min-w-0 items-center gap-gap-s">
            <span className="truncate text-headline1 font-semibold text-neutral">
              {applicant.name}
            </span>
            {applicant.positionName && (
              <Badge tone="neutral" variant="weak" className="shrink-0">
                {applicant.positionName}
              </Badge>
            )}
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-gap-m">
        <div className="flex items-center gap-gap-xs">
          <p className="flex-1 text-label1 font-semibold text-neutral">면접관</p>
          <button
            ref={addButtonRef}
            type="button"
            onClick={onAdd}
            className={cn(
              'flex h-8 cursor-pointer items-center gap-gap-xs rounded-s px-padding-xxs text-label1 font-semibold text-brand hover:bg-transparent-pressed',
              FOCUS_RING_CLASS,
            )}
          >
            <PlusIcon aria-hidden className="size-4" />
            추가
          </button>
        </div>
        {interviewers.length > 0 && (
          <ul className="flex flex-col gap-gap-m">
            {interviewers.map((interviewer) => (
              <li key={interviewer.id} className="flex items-center gap-gap-s">
                <Avatar />
                <span className="shrink-0 text-label1 font-medium text-neutral">
                  {interviewer.name}
                </span>
                {interviewer.isRepresentative && (
                  <Badge tone="brand" variant="weak" className="shrink-0">
                    대표
                  </Badge>
                )}
                <span className="min-w-0 flex-1 truncate text-caption1 font-medium text-neutral-subtle">
                  {interviewer.teamName}
                </span>
                <button
                  type="button"
                  aria-label={`${interviewer.name} 면접관에서 빼기`}
                  onClick={() => onRemove(interviewer.id)}
                  className={cn(
                    'flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-s text-neutral-subtle hover:bg-transparent-pressed',
                    FOCUS_RING_CLASS,
                  )}
                >
                  <CloseIcon aria-hidden className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

type InterviewerAddListProps = {
  options: InterviewerOption[]
  onBack: () => void
  onSelect: (interviewerId: string) => void
}

function InterviewerAddList({ options, onBack, onSelect }: InterviewerAddListProps) {
  const backButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    backButtonRef.current?.focus()
  }, [])

  return (
    <div className="flex flex-col gap-gap-m">
      <div className="flex items-center gap-gap-xs">
        <button
          ref={backButtonRef}
          type="button"
          aria-label="면접관 목록으로 돌아가기"
          onClick={onBack}
          className={cn(
            'flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-s text-neutral hover:bg-transparent-pressed',
            FOCUS_RING_CLASS,
          )}
        >
          <ChevronLeftIcon aria-hidden className="size-4" />
        </button>
        <p className="text-headline1 font-semibold text-neutral">면접관 추가</p>
      </div>
      {/* 4.5줄 높이, 넘치면 목록 안에서 스크롤 */}
      <ul className="flex max-h-62.5 flex-col gap-gap-xs overflow-y-auto">
        {options.map(({ interviewer, busyReason }) => {
          const isBusy = busyReason !== null

          return (
            <li key={interviewer.id}>
              {/* 고를 수 없는 이유를 읽을 수 있게 disabled 대신 aria-disabled 사용 */}
              <button
                type="button"
                aria-disabled={isBusy}
                onClick={() => {
                  if (!isBusy) {
                    onSelect(interviewer.id)
                  }
                }}
                className={cn(
                  'flex min-h-13 w-full items-center gap-gap-m rounded-m px-padding-s py-padding-xs text-left',
                  isBusy ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-layer-default-pressed',
                  FOCUS_RING_CLASS,
                )}
              >
                <Avatar className={cn(isBusy && 'opacity-40')} />
                <span className="flex min-w-0 flex-col gap-gap-xxs">
                  <span
                    className={cn(
                      'flex items-center gap-gap-xs font-medium',
                      isBusy ? 'text-disabled' : 'text-neutral-subtle',
                    )}
                  >
                    <span className={cn('text-label1', !isBusy && 'text-neutral')}>
                      {interviewer.name}
                    </span>
                    {interviewer.teamName && (
                      <span className="text-caption1">{interviewer.teamName}</span>
                    )}
                  </span>
                  {busyReason && (
                    <span className="text-caption1 font-medium text-critical">{busyReason}</span>
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export { InterviewerPopoverContent }
export type { InterviewerOption }
