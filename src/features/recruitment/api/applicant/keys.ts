const applicantApplicationKeys = {
  profile: ['applications', 'applicant', 'profile'] as const,
  myApplications: (postingId: string) =>
    ['applications', 'applicant', 'posting', postingId, 'mine'] as const,
}

export { applicantApplicationKeys }
