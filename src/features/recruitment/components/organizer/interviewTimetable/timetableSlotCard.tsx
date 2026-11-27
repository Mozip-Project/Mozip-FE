import { useState } from 'react'
import UsersIcon from '@/assets/icons/users.svg'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover/popover'
import type {
  TimetableApplicant,
  TimetableInterview,
  TimetableInterviewer,
} from '@/features/recruitment/types'
import { cn } from '@/lib/utils'
import { InterviewerPopoverContent, type InterviewerOption } from './interviewerPopoverContent'
import { TimetableApplicantName } from './timetableApplicantName'
import { TimetableDragHandle } from './timetableDragHandle'
import { FOCUS_RING_CLASS, SELECTED_BORDER_CLASS } from './timetableStyles'
import type { TimetableMoveActions } from './timetableMoveActions'

const DASHED_CHIP_CLASS =
  'rounded-full border border-dashed border-neutral-muted px-padding-xs py-padding-xxs'

type TimetableSlotCardProps = {
  interview: TimetableInterview
  applicants: TimetableApplicant[]
  interviewers: TimetableInterviewer[]
  interviewerOptions: InterviewerOption[]
  // 확정 후 보기 모드, 이동·면접관 편집 없이 장소 입력만 표시
  isReadOnly: boolean
  isDropTarget: boolean
  moveActions: TimetableMoveActions
  onInterviewersChange: (interviewerIds: string[]) => void
}

// 카드 아무 곳이나 누르면 면접관 편집, 핸들을 잡으면 이동
function TimetableSlotCard({
  interview,
  applicants,
  interviewers,
  interviewerOptions,
  isReadOnly,
  isDropTarget,
  moveActions,
  onInterviewersChange,
}: TimetableSlotCardProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [singleApplicant] = applicants
  const isGroup = applicants.length > 1
  const hasHandle = !isReadOnly
  const applicantNames = applicants.map(({ name }) => name).join(', ')
  const interviewerNames = interviewers.map(({ name }) => name).join(', ')
  const isHighlighted =
    isPopoverOpen ||
    isDropTarget ||
    moveActions.isMoving({ applicantIds: interview.applicantIds, fromInterviewId: interview.id })

  // Figma는 테두리를 안쪽에 그려 78px, 테두리 1px만큼 padding을 줄여 같은 높이 유지
  return (
    <div
      className={cn(
        '@container relative flex h-full min-w-0 flex-1 gap-gap-s rounded-m border bg-layer-default p-2.75',
        isHighlighted ? SELECTED_BORDER_CLASS : 'border-neutral-muted',
        isDropTarget && 'bg-brand-weak',
      )}
    >
      {hasHandle && !isGroup && singleApplicant && (
        <TimetableDragHandle
          applicant={singleApplicant}
          item={{ applicantIds: interview.applicantIds, fromInterviewId: interview.id }}
          moveActions={moveActions}
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-gap-s">
        {isGroup ? (
          // Figma 이름 칸 160px 2열, 두 열이 안 들어가면 1열
          <ul className="grid grid-cols-1 gap-x-gap-l gap-y-gap-xs @min-[21rem]:grid-cols-[repeat(2,10rem)]">
            {applicants.map((applicant) => {
              const item = { applicantIds: [applicant.id], fromInterviewId: interview.id }

              return (
                <li key={applicant.id} className="flex min-w-0 items-center gap-gap-s">
                  {hasHandle && (
                    <TimetableDragHandle
                      applicant={applicant}
                      item={item}
                      moveActions={moveActions}
                    />
                  )}
                  <TimetableApplicantName
                    applicant={applicant}
                    isDimmed={moveActions.isMoving(item)}
                  />
                </li>
              )
            })}
          </ul>
        ) : (
          singleApplicant && <TimetableApplicantName applicant={singleApplicant} />
        )}
        <div
          className={cn(
            'flex min-h-6.5 flex-wrap items-center gap-gap-m',
            isGroup && hasHandle && 'pl-6',
          )}
        >
          {isReadOnly ? (
            <>
              {interviewers.length > 0 && <InterviewerNames names={interviewerNames} />}
              {/* TODO: 장소 입력 팝오버는 확정 후 장소 입력 단계에서 연결 */}
              <span
                className={cn(DASHED_CHIP_CLASS, 'text-caption1 font-medium text-neutral-subtle')}
              >
                장소 입력
              </span>
            </>
          ) : (
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                {/* after로 카드 전체를 누를 수 있는 영역으로 확장 */}
                <button
                  type="button"
                  aria-label={`${applicantNames} 면접관: ${interviewerNames || '면접관 추가'}`}
                  className={cn(
                    'flex min-w-0 cursor-pointer rounded-full',
                    'after:absolute after:inset-0 after:rounded-m',
                    interviewers.length === 0 && DASHED_CHIP_CLASS,
                    FOCUS_RING_CLASS,
                  )}
                >
                  <InterviewerNames names={interviewerNames || '면접관 추가'} />
                </button>
              </PopoverTrigger>
              <PopoverContent
                aria-label={`${applicantNames} 면접관 편집`}
                className="w-100 p-padding-xl"
              >
                <InterviewerPopoverContent
                  applicants={applicants}
                  interviewers={interviewers}
                  options={interviewerOptions}
                  onInterviewersChange={onInterviewersChange}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </div>
  )
}

// Figma 배정된 면접관은 테두리·여백 없이 아이콘과 이름만
function InterviewerNames({ names }: { names: string }) {
  return (
    <span className="flex min-w-0 items-center gap-gap-xxs text-caption1 font-medium text-neutral-subtle">
      <UsersIcon aria-hidden className="size-4 shrink-0" />
      <span className="truncate">{names}</span>
    </span>
  )
}

export { TimetableSlotCard }
