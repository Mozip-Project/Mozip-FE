import ArrowRightIcon from '@/assets/icons/arrowRight.svg'
import DownloadIcon from '@/assets/icons/download.svg'
import { Button } from '@/components/ui/Button/button'
import { PageHeader } from './pageHeader'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/PageHeader',
  component: PageHeader,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof PageHeader>

export default meta
// 필수 props를 render 안에서 직접 넘겨 args 타입 연결 제외
type Story = StoryObj

const DESCRIPTION = '서류 평가가 마감됐어요. 평가하지 않은 지원서는 더 이상 평가할 수 없어요.'

export const Default: Story = {
  render: () => (
    <PageHeader
      title="지원자 목록"
      description={DESCRIPTION}
      actions={
        <Button variant="secondary" size="m">
          <DownloadIcon aria-hidden />
          엑셀 내보내기
        </Button>
      }
    />
  ),
}

export const WithPrimaryAction: Story = {
  render: () => (
    <PageHeader
      title="지원자 목록"
      description={DESCRIPTION}
      actions={
        <>
          <Button variant="secondary" size="m">
            <DownloadIcon aria-hidden />
            엑셀 내보내기
          </Button>
          <Button size="m">
            평가 결과 취합하기
            <ArrowRightIcon aria-hidden />
          </Button>
        </>
      }
    />
  ),
}

export const TitleOnly: Story = {
  render: () => <PageHeader title="지원자 목록" />,
}
