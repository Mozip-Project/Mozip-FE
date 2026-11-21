const organizationKeys = {
  all: ['organization'] as const,
  members: (organizationId: string) => ['organization', organizationId, 'members'] as const,
}

export { organizationKeys }
