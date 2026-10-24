import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

let payload

try {
  payload = JSON.parse(readFileSync(0, 'utf8'))
} catch {
  process.exit(0)
}

const filePath = payload.tool_input?.file_path ?? ''

if (!/\.(ts|tsx)$/.test(filePath)) {
  process.exit(0)
}

try {
  execFileSync('pnpm', ['exec', 'eslint', '--quiet', filePath], {
    encoding: 'utf8',
    timeout: 30_000,
  })
} catch (error) {
  // exit 2 + stderr로 Claude에게 lint 결과 전달 (편집은 이미 적용된 상태)
  const output = `${error.stdout ?? ''}${error.stderr ?? ''}`.trimEnd()
  console.error(`ESLint 오류가 있습니다. 수정하세요.\n${output.split('\n').slice(-10).join('\n')}`)
  process.exit(2)
}
