const applicantApplicationKeys = {
  profile: ['applications', 'applicant', 'profile'] as const,
  // 지원서 양식(포지션·문항·면접 시간)
  form: (postingId: string) => ['applications', 'applicant', 'posting', postingId, 'form'] as const,
  myApplications: (postingId: string) =>
    ['applications', 'applicant', 'posting', postingId, 'mine'] as const,
  mine: ['applications', 'applicant', 'mine'] as const,
  submitted: (applicationId: string) =>
    ['applications', 'applicant', 'submitted', applicationId] as const,
}

export { applicantApplicationKeys }
