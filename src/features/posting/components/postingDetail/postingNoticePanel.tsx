import Image from 'next/image'
import type {
  PostingContentBlock,
  PostingDetail,
  PostingRichTextRun,
} from '@/features/posting/types'

type PostingNoticePanelProps = Pick<PostingDetail, 'title' | 'coverImageUrl' | 'content'> & {
  // 작성 중 미리보기처럼 허용 호스트가 아닌 주소(방금 고른 파일 등)도 그대로 표시
  isCoverImageUnoptimized?: boolean
}

// 서버가 준 순서 그대로 그리는 정적 본문이라 index key 사용
function renderRuns(runs: readonly PostingRichTextRun[]) {
  return runs.map(({ text, isBold, isItalic }, index) => {
    const italicText = isItalic ? <em>{text}</em> : text

    return isBold ? (
      <strong key={index} className="font-semibold text-neutral">
        {italicText}
      </strong>
    ) : (
      <span key={index}>{italicText}</span>
    )
  })
}

function renderBlock(block: PostingContentBlock, index: number) {
  switch (block.type) {
    case 'heading':
      return (
        // 단락 사이 24px = 줄 간격 8px + 16px
        <h2 key={index} className="text-headline1 font-semibold text-neutral not-first:mt-gap-l">
          {block.text}
        </h2>
      )
    case 'paragraph':
      return <p key={index}>{renderRuns(block.runs)}</p>
    case 'list':
      return (
        <ul key={index} className="list-disc ps-[1.5em]">
          {block.items.map((runs, itemIndex) => (
            <li key={itemIndex}>{renderRuns(runs)}</li>
          ))}
        </ul>
      )
  }
}

function PostingNoticePanel({
  title,
  coverImageUrl,
  content,
  isCoverImageUnoptimized = false,
}: PostingNoticePanelProps) {
  return (
    <div className="flex flex-col gap-gap-xxl">
      {coverImageUrl && (
        <div className="relative aspect-2/1 overflow-hidden rounded-l border border-neutral-subtle">
          <Image
            src={coverImageUrl}
            alt={`${title} 대표 이미지`}
            fill
            sizes="(min-width: 1280px) 780px, 100vw"
            unoptimized={isCoverImageUnoptimized}
            className="object-cover"
          />
        </div>
      )}
      <div className="flex flex-col gap-gap-s text-body2 font-normal break-words break-keep whitespace-pre-line text-neutral-muted">
        {content.map(renderBlock)}
      </div>
    </div>
  )
}

export { PostingNoticePanel }
