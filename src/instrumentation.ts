async function register() {
  if (
    process.env.NEXT_RUNTIME === 'nodejs' &&
    process.env.NODE_ENV === 'development' &&
    process.env.NEXT_PUBLIC_API_MOCKING === 'enabled'
  ) {
    const { server } = await import('./mocks/server')

    server.listen({
      onUnhandledFrame: 'warn',
    })
  }
}

export { register }
