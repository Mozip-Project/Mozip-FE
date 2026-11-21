const organizationKeys = {
  all: ['organization'] as const,
  detail: (organizationId: string) => ['organization', organizationId, 'detail'] as const,
  members: (organizationId: string) => ['organization', organizationId, 'members'] as const,
  keywordSuggestions: (query: string) => ['organization', 'keywordSuggestions', query] as const,
}

export { organizationKeys }
