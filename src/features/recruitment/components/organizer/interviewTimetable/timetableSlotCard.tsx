import { useState } from 'react'
import UsersIcon from '@/assets/icons/users.svg'
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover/popover'
import type { TimetableMode } from '@/features/recruitment/hooks/useInterviewTimetable'
import type {
  TimetableApplicant,
  TimetableInterview,
  TimetableInterviewer,
} from '@/features/recruitment/types'
import { cn } from '@/lib/utils'
import { InterviewerPopoverContent, type InterviewerOption } from './interviewerPopoverContent'
import { LocationPopoverContent } from './locationPopoverContent'
import { TimetableApplicantName } from './timetableApplicantName'
import { TimetableDragHandle } from './timetableDragHandle'
import { FOCUS_RING_CLASS, POPOVER_BELOW_OFFSET_PX, SELECTED_BORDER_CLASS } from './timetableStyles'
import type { TimetableMoveActions } from './timetableMoveActions'

const DASHED_CHIP_CLASS =
  'rounded-full border border-dashed border-neutral-muted px-padding-xs py-padding-xxs'

type TimetableSlotCardProps = {
  interview: TimetableInterview
  applicants: TimetableApplicant[]
  interviewers: TimetableInterviewer[]
  interviewerOptions: InterviewerOption[]
  mode: TimetableMode
  isDropTarget: boolean
  recentLocations: string[]
  moveActions: TimetableMoveActions
  onInterviewersChange: (interviewerIds: string[]) => void
  onLocationChange: (location: string) => void
}

// 배정·수정 중에는 카드를 누르면 면접관 편집, 보기 모드에서는 장소 칩을 누르면 장소 변경
function TimetableSlotCard({
  interview,
  applicants,
  interviewers,
  interviewerOptions,
  mode,
  isDropTarget,
  recentLocations,
  moveActions,
  onInterviewersChange,
  onLocationChange,
}: TimetableSlotCardProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [singleApplicant] = applicants
  const isGroup = applicants.length > 1
  const isLocationEditable = mode === 'view'
  const hasHandle = !isLocationEditable
  const showsLocation = mode !== 'assign'
  const applicantNames = applicants.map(({ name }) => name).join(', ')
  const interviewerNames = interviewers.map(({ name }) => name).join(', ')
  const isHighlighted =
    isPopoverOpen ||
    isDropTarget ||
    moveActions.isMoving({ applicantIds: interview.applicantIds, fromInterviewId: interview.id })

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverAnchor asChild>
        {/* Figma는 테두리를 안쪽에 그려 78px, 테두리 1px만큼 padding을 줄여 같은 높이 유지 */}
        <div
          className={cn(
            '@container relative flex h-full min-w-0 flex-1 gap-gap-s rounded-m border bg-layer-default p-2.75',
            isHighlighted ? SELECTED_BORDER_CLASS : 'border-neutral-muted',
            (isDropTarget || (isLocationEditable && isPopoverOpen)) && 'bg-brand-weak',
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
              {isLocationEditable ? (
                <>
                  {interviewers.length > 0 && <InterviewerNames names={interviewerNames} />}
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label={`${applicantNames} 면접 장소: ${interview.location ?? '입력 전'}`}
                      className={cn(
                        'cursor-pointer text-caption1 font-medium text-neutral-subtle',
                        interview.location ? 'rounded-xs' : DASHED_CHIP_CLASS,
                        FOCUS_RING_CLASS,
                      )}
                    >
                      {interview.location ?? '장소 입력'}
                    </button>
                  </PopoverTrigger>
                </>
              ) : (
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
              )}
              {/* 수정 중 장소는 보기만, 장소 변경은 보기 모드에서 */}
              {showsLocation && !isLocationEditable && (
                <span
                  className={cn(
                    'text-caption1 font-medium text-neutral-subtle',
                    !interview.location && DASHED_CHIP_CLASS,
                  )}
                >
                  {interview.location ?? '장소 입력'}
                </span>
              )}
            </div>
          </div>
        </div>
      </PopoverAnchor>
      {isLocationEditable ? (
        <PopoverContent
          aria-label="면접 장소 변경"
          sideOffset={POPOVER_BELOW_OFFSET_PX}
          className="w-(--radix-popover-trigger-width) border-neutral-muted p-padding-l"
        >
          <LocationPopoverContent
            title="면접 장소 변경"
            initialLocation={interview.location ?? ''}
            recentLocations={recentLocations}
            onApply={(location) => {
              onLocationChange(location)
              setIsPopoverOpen(false)
            }}
          />
        </PopoverContent>
      ) : (
        <PopoverContent
          aria-label={`${applicantNames} 면접관 편집`}
          sideOffset={POPOVER_BELOW_OFFSET_PX}
          className="w-100 p-padding-xl"
        >
          <InterviewerPopoverContent
            applicants={applicants}
            interviewers={interviewers}
            options={interviewerOptions}
            onInterviewersChange={onInterviewersChange}
          />
        </PopoverContent>
      )}
    </Popover>
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
