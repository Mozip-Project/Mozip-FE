import { redirect } from 'next/navigation'
import {
  INTERVIEW_SEARCH_PARAM,
  parseHasInterview,
} from '@/features/posting/utils/postingCreateRoute'
import { PostingCreateForm } from './postingCreateForm'

type PostingCreateContentProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function PostingCreateContent({ searchParams }: PostingCreateContentProps) {
  const hasInterview = parseHasInterview((await searchParams)[INTERVIEW_SEARCH_PARAM])

  if (hasInterview === null) {
    redirect('/manage')
  }

  return <PostingCreateForm hasInterview={hasInterview} />
}

export { PostingCreateContent }
