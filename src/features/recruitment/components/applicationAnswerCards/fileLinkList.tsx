import { AttachmentItem } from '@/components/ui/AttachmentItem/attachmentItem'
import type { ComponentProps } from 'react'

type FileLinkAttachment = Omit<ComponentProps<typeof AttachmentItem>, 'className'> & {
  id: string
}

type FileLinkListProps = {
  attachments: readonly FileLinkAttachment[]
}

// 파일·링크 문항 카드의 첨부 목록
function FileLinkList({ attachments }: FileLinkListProps) {
  if (attachments.length === 0) {
    return null
  }

  return (
    // Safari VoiceOver 목록 인식용 role
    <ul role="list" className="flex flex-wrap gap-gap-s">
      {attachments.map(({ id, ...attachment }) => (
        <li key={id} className="max-w-full">
          <AttachmentItem {...attachment} />
        </li>
      ))}
    </ul>
  )
}

export { FileLinkList }
export type { FileLinkAttachment }
