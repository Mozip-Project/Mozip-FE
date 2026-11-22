const userKeys = {
  me: ['user', 'me'] as const,
  myAccount: ['user', 'me', 'account'] as const,
}

const userMutationKeys = {
  updateNotificationSettings: ['user', 'updateNotificationSettings'] as const,
}

export { userKeys, userMutationKeys }
