async function register() {
  // 브라우저 MockProvider와 같은 값 하나로 켜고 끔
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.NEXT_PUBLIC_API_MOCKING === 'enabled') {
    const { server } = await import('./mocks/server')

    server.listen({
      onUnhandledFrame: 'warn',
    })
  }
}

export { register }
