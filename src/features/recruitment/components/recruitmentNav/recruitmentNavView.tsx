import FileTextIcon from '@/assets/icons/fileText.svg'
import MegaphoneIcon from '@/assets/icons/megaphone.svg'
import MessageIcon from '@/assets/icons/message.svg'
import UsersIcon from '@/assets/icons/users.svg'
import type { DocumentResultOverview } from '@/features/recruitment/types'
import { Lnb } from './lnb'
import { LnbStageItem } from './lnbStageItem'
import { LnbSubItem } from './lnbSubItem'
import { RecruitSwitcher } from './recruitSwitcher'

// TODO: LNB 디자인 확정 후 변경, 현재는 레이아웃용 임시 디자인
type RecruitmentNavViewProps = {
  // null은 조회 전, 면접 평가 메뉴가 나타났다 사라지지 않도록 숨김
  overview: DocumentResultOverview | null
  // 목록·작성 화면처럼 공고 ID가 없으면 공고별 상태 생략
  isPostingSelected?: boolean
}

function RecruitmentNavView({ overview, isPostingSelected = true }: RecruitmentNavViewProps) {
  const isConfirmed = Boolean(overview?.confirmedAt)
  const documentStatusLabel = isConfirmed ? '완료' : '진행 중'

  return (
    <Lnb
      switcher={
        isPostingSelected ? (
          <RecruitSwitcher
            name="UXUX 14기 신입 부원 모집"
            statusLabel={isConfirmed ? '서류 평가 완료' : '서류 평가 진행 중'}
            scheduleLabel="지원 마감 10/16 (금)"
          />
        ) : (
          // TODO: 공고 선택 전 문구 디자인 확정 후 교체
          <RecruitSwitcher name="공고를 선택해 주세요" />
        )
      }
    >
      <li>
        <LnbStageItem
          icon={<MegaphoneIcon aria-hidden />}
          label="공고 관리"
          statusLabel={isPostingSelected ? '마감' : undefined}
          isExpanded
        />
      </li>
      <li>
        <LnbSubItem label="공고 관리" path="postings" />
      </li>
      <li>
        <LnbSubItem label="공고 작성" path="postings/new" />
      </li>
      <li>
        <LnbStageItem icon={<UsersIcon aria-hidden />} label="지원자 관리" />
      </li>
      <li>
        <LnbStageItem
          icon={<FileTextIcon aria-hidden />}
          label="서류 평가"
          statusLabel={isPostingSelected ? documentStatusLabel : undefined}
          isActive={isPostingSelected}
          isStatusHighlighted
          isExpanded
        />
      </li>
      <li>
        <LnbSubItem label="서류 평가" path="documents" />
      </li>
      <li>
        <LnbSubItem label="서류 평가 취합" path="documents/summary" />
      </li>
      {overview?.hasInterview && (
        <li>
          <LnbStageItem
            icon={<MessageIcon aria-hidden />}
            label="면접 평가"
            statusLabel={isConfirmed ? '진행 전' : '대기'}
            isExpanded={false}
          />
        </li>
      )}
    </Lnb>
  )
}

export { RecruitmentNavView }
