'use client'

import { useRouter } from 'next/navigation'
import {
  ApplicantChipStrip,
  type StripApplicant,
} from '@/components/ui/ApplicantChipStrip/applicantChipStrip'
import { StickyTopBar } from '@/components/ui/StickyTopBar/stickyTopBar'
import type { Route } from 'next'

type DocumentEvaluationChipStripProps = {
  recruitmentId: string
  applicants: readonly StripApplicant[]
  currentId: string
}

function DocumentEvaluationChipStrip({
  recruitmentId,
  applicants,
  currentId,
}: DocumentEvaluationChipStripProps) {
  const router = useRouter()

  function handleSelect(applicantId: string) {
    router.push(`/manage/recruitments/${recruitmentId}/documents/${applicantId}` as Route)
  }

  return (
    // 지원서를 읽다가 바로 다른 지원자로 이동하도록 고정
    <StickyTopBar>
      <ApplicantChipStrip
        label="지원자 목록"
        applicants={applicants}
        currentId={currentId}
        onSelect={handleSelect}
      />
    </StickyTopBar>
  )
}

export { DocumentEvaluationChipStrip }
