// 개발 서버 introspection 결과를 schema.graphql로 저장, 백엔드 가이드상 스키마 기준은 introspection
import { writeFileSync } from 'node:fs'
import { buildClientSchema, getIntrospectionQuery, printSchema } from 'graphql'

const SCHEMA_PATH = 'schema.graphql'
const HEADER = '# pnpm schema:pull로 개발 서버 introspection 결과를 받은 파일, 직접 수정 금지\n\n'
// 응답 본문 읽기까지 포함한 전체 제한 시간
const REQUEST_TIMEOUT_MS = 30_000

const endpoint = process.env.GRAPHQL_SCHEMA_ENDPOINT

if (!endpoint) {
  console.error('GRAPHQL_SCHEMA_ENDPOINT가 없음, .env.local에 개발 서버 GraphQL 주소 필요')
  process.exit(1)
}

const response = await fetch(endpoint, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ query: getIntrospectionQuery() }),
  signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
})
const result = await response.json()

// 일부 필드만 실패한 응답으로 기존 스키마를 덮어쓰지 않도록 errors가 있으면 중단
if (!response.ok || !result.data || result.errors?.length) {
  console.error(
    `introspection 실패 (HTTP ${response.status})`,
    JSON.stringify(result.errors ?? result),
  )
  process.exit(1)
}

writeFileSync(SCHEMA_PATH, `${HEADER}${printSchema(buildClientSchema(result.data))}\n`)
