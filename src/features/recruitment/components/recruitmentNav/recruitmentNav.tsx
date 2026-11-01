import FileTextIcon from '@/assets/icons/fileText.svg'
import MegaphoneIcon from '@/assets/icons/megaphone.svg'
import MessageIcon from '@/assets/icons/message.svg'
import UsersIcon from '@/assets/icons/users.svg'
import { Lnb } from './lnb'
import { LnbStageItem } from './lnbStageItem'
import { LnbSubItem } from './lnbSubItem'
import { RecruitSwitcher } from './recruitSwitcher'

// TODO: LNB 디자인 확정 후 변경, 현재는 레이아웃용 임시 디자인
function RecruitmentNav() {
  return (
    <Lnb
      switcher={
        <RecruitSwitcher
          name="UXUX 14기 신입 부원 모집"
          statusLabel="서류 평가 진행 중"
          scheduleLabel="지원 마감 10/16 (금)"
        />
      }
    >
      <li>
        <LnbStageItem icon={<MegaphoneIcon aria-hidden />} label="공고 관리" statusLabel="마감" />
      </li>
      <li>
        <LnbStageItem icon={<UsersIcon aria-hidden />} label="지원자 관리" />
      </li>
      <li>
        <LnbStageItem
          icon={<FileTextIcon aria-hidden />}
          label="서류 평가"
          statusLabel="진행 중"
          isActive
          isStatusHighlighted
          isExpanded
        />
      </li>
      <li>
        <LnbSubItem label="서류 평가" isActive />
      </li>
      <li>
        <LnbSubItem label="서류 평가 취합" />
      </li>
      <li>
        <LnbStageItem
          icon={<MessageIcon aria-hidden />}
          label="면접 평가"
          statusLabel="대기"
          isExpanded={false}
        />
      </li>
    </Lnb>
  )
}

export { RecruitmentNav }
