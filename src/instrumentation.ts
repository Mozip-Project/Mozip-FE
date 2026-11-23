async function register() {
  // 브라우저 MockProvider와 같은 값 하나로 켜고 끔
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.NEXT_PUBLIC_API_MOCKING === 'enabled') {
    const { server } = await import('./mocks/server')

    server.listen({
      onUnhandledFrame: 'warn',
    })

    // Next dev가 HMR 때 fetch를 되돌려 MSW가 풀리는 문제 방지
    if (process.env.NODE_ENV === 'development') {
      const mockedFetch = globalThis.fetch
      let currentFetch = mockedFetch

      Object.defineProperty(globalThis, 'fetch', {
        configurable: true,
        enumerable: true,
        get: () => currentFetch,
        set: (nextFetch: typeof fetch) => {
          const isNextPatched = Reflect.get(nextFetch, '__nextPatched') === true
          currentFetch = isNextPatched ? nextFetch : mockedFetch
        },
      })
    }
  }
}

export { register }
