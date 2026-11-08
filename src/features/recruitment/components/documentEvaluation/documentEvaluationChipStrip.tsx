'use client'

import { useRouter } from 'next/navigation'
import {
  ApplicantChipStrip,
  type StripApplicant,
} from '@/components/ui/ApplicantChipStrip/applicantChipStrip'
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
    <ApplicantChipStrip
      label="지원자 목록"
      applicants={applicants}
      currentId={currentId}
      onSelect={handleSelect}
    />
  )
}

export { DocumentEvaluationChipStrip }
