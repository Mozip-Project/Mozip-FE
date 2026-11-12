import PlusIcon from '@/assets/icons/plus.svg'
import { Button } from '@/components/ui/Button/button'
import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import { PostingManageBoard } from '@/features/posting/components/postingManage/postingManageBoard'

export default function RecruitmentPostingsPage() {
  return (
    <div className="flex flex-col gap-gap-xl">
      <PageHeader
        title="공고 관리"
        className="min-h-10"
        actions={
          // TODO: 공고 작성 경로가 생기면 Link로 연결
          <Button size="m">
            <PlusIcon aria-hidden />새 공고 작성
          </Button>
        }
      />
      {/* 삭제·UP 결과를 바로 반영하도록 목록은 클라이언트에서 조회 */}
      <PostingManageBoard />
    </div>
  )
}
