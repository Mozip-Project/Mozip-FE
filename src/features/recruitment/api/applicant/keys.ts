const applicantApplicationKeys = {
  profile: ['applications', 'applicant', 'profile'] as const,
  myApplications: (postingId: string) =>
    ['applications', 'applicant', 'posting', postingId, 'mine'] as const,
  mine: ['applications', 'applicant', 'mine'] as const,
  submitted: (applicationId: string) =>
    ['applications', 'applicant', 'submitted', applicationId] as const,
}

export { applicantApplicationKeys }
