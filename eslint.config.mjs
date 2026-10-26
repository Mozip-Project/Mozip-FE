import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'
import storybook from 'eslint-plugin-storybook'
import unusedImports from 'eslint-plugin-unused-imports'
import tseslint from 'typescript-eslint'

const eslintConfig = defineConfig([
  // 1. Next.js 공식 규칙 (React, Hooks, 접근성, import 플러그인 포함)
  ...nextVitals,
  ...nextTs,

  // 2. 모든 JS/TS 파일에 적용하는 공통 규칙
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      // 기본 문법
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-implicit-coercion': 'error',

      // 안 쓰는 import·변수 (_로 시작하면 예외)
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      // import 정리
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      'import/no-duplicates': ['error', { 'prefer-inline': true }],
      'import/no-cycle': 'error',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index'], 'type'],
          pathGroups: [{ pattern: '@/**', group: 'internal', position: 'before' }],
          pathGroupsExcludedImportTypes: ['builtin'],
          alphabetize: { order: 'asc', caseInsensitive: true },
          'newlines-between': 'never',
        },
      ],

      // Pages Router 전용 API 사용 금지
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'next/router',
              message: 'App Router에서는 next/navigation을 사용하세요.',
            },
            {
              name: 'next/document',
              message: 'App Router에서는 layout.tsx와 metadata API를 사용하세요.',
            },
          ],
        },
      ],
    },
  },

  // 3. src 안의 TS 파일: 타입 정보를 사용하는 더 깊은 검사
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // recommendedTypeChecked가 다시 켜는 규칙 끄기 (unused-imports가 대신 검사)
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      'no-console': ['error', { allow: ['error', 'warn'] }],
    },
  },

  // 4. Storybook 스토리 파일 규칙
  ...storybook.configs['flat/recommended'],

  // 5. Prettier와 겹치는 포맷 규칙 끄기 (항상 마지막)
  prettier,

  // 6. prettier가 끄는 규칙 중 다시 켤 것 (if문 중괄호 필수)
  {
    rules: {
      curly: ['error', 'all'],
    },
  },

  globalIgnores(['.next/**', 'out/**', 'build/**', 'coverage/**', 'next-env.d.ts']),
])

export default eslintConfig
