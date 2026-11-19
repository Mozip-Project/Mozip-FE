import Image from 'next/image'
import type {
  PostingContentBlock,
  PostingDetail,
  PostingRichTextRun,
} from '@/features/posting/types'

type PostingNoticePanelProps = Pick<PostingDetail, 'title' | 'coverImage' | 'content'>

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

function PostingNoticePanel({ title, coverImage, content }: PostingNoticePanelProps) {
  return (
    <div className="flex flex-col gap-gap-xxl">
      {coverImage ? (
        <Image
          src={coverImage.src}
          width={coverImage.width}
          height={coverImage.height}
          alt={`${title} 대표 이미지`}
          sizes="(min-width: 1280px) 780px, 100vw"
          className="h-auto w-full rounded-l border border-neutral-subtle"
        />
      ) : (
        // TODO: 대표 이미지 API 연결 후 삭제, 현재는 이미지 비어있는 목데이터라 추가해둠
        <div
          aria-hidden
          className="h-97.5 rounded-l border border-neutral-subtle bg-neutral-weak"
        />
      )}
      <div className="flex flex-col gap-gap-s text-body2 font-normal break-words break-keep text-neutral-muted">
        {content.map(renderBlock)}
      </div>
    </div>
  )
}

export { PostingNoticePanel }
