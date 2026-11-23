'use client'

import { useRef } from 'react'
import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import { StickyTopBar } from '@/components/ui/StickyTopBar/stickyTopBar'
import { useStickyTopBarHeight } from '@/hooks/useStickyTopBarHeight'
import { PostingSearchField } from './postingSearchField'

type PostingListHeaderProps = {
  title: string
}

function PostingListHeader({ title }: PostingListHeaderProps) {
  const ref = useRef<HTMLDivElement>(null)
  useStickyTopBarHeight(ref)

  return (
    <StickyTopBar className="-mb-gap-s">
      <div ref={ref} className="pb-gap-s">
        <PageHeader title={title} actions={<PostingSearchField />} />
      </div>
    </StickyTopBar>
  )
}

export { PostingListHeader }
