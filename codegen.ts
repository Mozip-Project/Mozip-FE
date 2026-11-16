import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: 'schema.graphql',
  documents: ['src/features/**/api/**/*.ts'],
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
      },
    },
  },
}

export default config
