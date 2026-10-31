import FileTextIcon from '@/assets/icons/fileText.svg'
import MegaphoneIcon from '@/assets/icons/megaphone.svg'
import { Lnb } from './lnb'
import { LnbStageItem } from './lnbStageItem'
import { LnbSubItem } from './lnbSubItem'
import { RecruitSwitcher } from './recruitSwitcher'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'Features/Recruitment/Lnb',
  component: Lnb,
  parameters: { controls: { disable: true } },
  decorators: [
    (Story) => (
      <div className="w-55">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Lnb>

export default meta
// 필수 props를 render 안에서 직접 넘겨 args 타입 연결 제외
type Story = StoryObj

export const Default: Story = {
  render: () => (
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
    </Lnb>
  ),
}
