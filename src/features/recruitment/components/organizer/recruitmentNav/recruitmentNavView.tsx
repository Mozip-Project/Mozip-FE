import FileTextIcon from '@/assets/icons/fileText.svg'
import MegaphoneIcon from '@/assets/icons/megaphone.svg'
import MessageIcon from '@/assets/icons/message.svg'
import UsersIcon from '@/assets/icons/users.svg'
import { PostingStartDialog } from '@/features/posting/components/postingCreate/postingStartDialog'
import {
  getDocumentStageStatus,
  getInterviewStageStatus,
  getPostingStageStatus,
  type LnbStageStatus,
} from '@/features/recruitment/utils/recruitmentNavStatus'
import type { PostingStatus } from '@/gql/graphql'
import { Lnb } from './lnb'
import { LnbStageGroup, LnbStageItem, LnbStageLink } from './lnbStageItem'
import { LnbSubButton, LnbSubItem } from './lnbSubItem'
import type { ReactNode } from 'react'

type LnbSection = 'posting' | 'documents' | 'interviews'

type RecruitmentNavViewProps = {
  switcher: ReactNode
  // null은 공고 선택 전이거나 조회 중
  postingStatus: PostingStatus | null
  hasInterview: boolean
  currentSection: LnbSection | null
  isCreatingPosting?: boolean
}

const EMPTY_STATUS_LABEL = '—'

const INTERVIEW_AVAILABLE_STATUSES = new Set<PostingStatus>(['INTERVIEW', 'FINAL_RESULT', 'ENDED'])

function toStatusProps(status: LnbStageStatus | null) {
  return { statusLabel: status?.label, isStatusHighlighted: status?.isHighlighted ?? false }
}

function RecruitmentNavView({
  switcher,
  postingStatus,
  hasInterview,
  currentSection,
  isCreatingPosting = false,
}: RecruitmentNavViewProps) {
  const isDraft = postingStatus === 'DRAFT'
  // 조회 중이거나 게시 전이면 지원자 관리부터 비활성
  const isPublished = postingStatus !== null && !isDraft

  return (
    <Lnb switcher={switcher}>
      <li>
        <LnbStageGroup
          icon={<MegaphoneIcon aria-hidden />}
          label="공고 관리"
          isCurrent={currentSection === 'posting'}
          {...toStatusProps(postingStatus && getPostingStageStatus(postingStatus))}
        >
          <li>
            <PostingStartDialog>
              <LnbSubButton isCurrent={isCreatingPosting}>공고 작성</LnbSubButton>
            </PostingStartDialog>
          </li>
          <li>
            <LnbSubItem label="공고 관리" path="postings" />
          </li>
        </LnbStageGroup>
      </li>
      <li>
        <LnbStageLink
          icon={<UsersIcon aria-hidden />}
          label="지원자 관리"
          path="applicants"
          isDisabled={!isPublished}
        />
      </li>
      <li>
        {isPublished ? (
          <LnbStageGroup
            icon={<FileTextIcon aria-hidden />}
            label="서류 평가"
            isCurrent={currentSection === 'documents'}
            {...toStatusProps(getDocumentStageStatus(postingStatus))}
          >
            <li>
              <LnbSubItem label="서류 평가" path="documents" />
            </li>
            <li>
              <LnbSubItem label="서류 평가 취합" path="documents/summary" />
            </li>
          </LnbStageGroup>
        ) : (
          <LnbStageItem
            icon={<FileTextIcon aria-hidden />}
            label="서류 평가"
            isExpanded={false}
            isDisabled
            {...toStatusProps(isDraft ? getDocumentStageStatus('DRAFT') : null)}
          />
        )}
      </li>
      {postingStatus && hasInterview && (
        <li>
          {INTERVIEW_AVAILABLE_STATUSES.has(postingStatus) ? (
            // Figma MVP: 면접 평가 하위는 타임테이블만
            <LnbStageGroup
              icon={<MessageIcon aria-hidden />}
              label="면접 평가"
              isCurrent={currentSection === 'interviews'}
              {...toStatusProps(getInterviewStageStatus(postingStatus))}
            >
              <li>
                <LnbSubItem label="타임테이블" path="interviews/timetable" />
              </li>
            </LnbStageGroup>
          ) : (
            <LnbStageItem
              icon={<MessageIcon aria-hidden />}
              label="면접 평가"
              isExpanded={false}
              isDisabled
              {...toStatusProps(getInterviewStageStatus(postingStatus))}
            />
          )}
        </li>
      )}
    </Lnb>
  )
}

// 새 모집 만들기는 본문 빈 상태에서 제공
function EmptyRecruitmentNavView() {
  return (
    <Lnb
      switcher={
        <p className="rounded-l border border-dashed border-neutral-muted bg-layer-basement p-padding-m text-label1 font-semibold text-neutral">
          진행 중인 모집이 없어요
        </p>
      }
    >
      <li>
        <LnbStageItem
          icon={<MegaphoneIcon aria-hidden />}
          label="공고 관리"
          statusLabel={EMPTY_STATUS_LABEL}
          isExpanded={false}
          isDisabled
        />
      </li>
      <li>
        <LnbStageItem icon={<UsersIcon aria-hidden />} label="지원자 관리" isDisabled />
      </li>
      <li>
        <LnbStageItem
          icon={<FileTextIcon aria-hidden />}
          label="서류 평가"
          statusLabel={EMPTY_STATUS_LABEL}
          isExpanded={false}
          isDisabled
        />
      </li>
      <li>
        <LnbStageItem
          icon={<MessageIcon aria-hidden />}
          label="면접 평가"
          statusLabel={EMPTY_STATUS_LABEL}
          isExpanded={false}
          isDisabled
        />
      </li>
    </Lnb>
  )
}

export { EmptyRecruitmentNavView, RecruitmentNavView }
export type { LnbSection }
