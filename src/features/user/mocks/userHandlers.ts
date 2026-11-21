import { delay, HttpResponse } from 'msw'
import type { MeQuery, MeQueryVariables } from '@/gql/graphql'
import { graphqlApi } from '@/mocks/graphqlApi'
import { MOCK_RESPONSE_DELAY_MS } from '@/mocks/responseDelay'

// 이름은 모두 가상, 단체 1은 대표자·단체 2는 운영진으로 소속
const ME_SAMPLE = {
  id: 'user-1',
  lastOrganization: { id: '1' },
  memberships: [
    { role: 'REPRESENTATIVE', organization: { id: '1', name: 'UXUX' } },
    { role: 'OPERATOR', organization: { id: '2', name: '멋쟁이개발자' } },
  ],
} satisfies MeQuery['me']

const userHandlers = [
  graphqlApi.query<MeQuery, MeQueryVariables>('Me', async () => {
    await delay(MOCK_RESPONSE_DELAY_MS)
    return HttpResponse.json({ data: { me: ME_SAMPLE } })
  }),
]

export { userHandlers }
