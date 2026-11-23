import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  // 서버 스키마(introspection)와 서버 미구현 임시 정의를 합쳐 사용
  schema: ['schema.graphql', 'schema.pending.graphql'],
  documents: ['src/features/**/api/**/*.graphql'],
  ignoreNoDocuments: true,
  generates: {
    'src/gql/': {
      preset: 'client',
      presetConfig: {
        fragmentMasking: false,
      },
      config: {
        documentMode: 'string',
        useTypeImports: true,
        enumsAsTypes: true,
        // 미지정 scalar는 any로 생성되어 명시
        scalars: {
          DateTime: 'string',
          Date: 'string',
        },
      },
    },
  },
}

export default config
