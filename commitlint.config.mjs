/** @type {import('@commitlint/types').UserConfig} */
const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // 새 기능
        'fix', // 버그 수정
        'refactor', // 동작 변경 없는 코드 개선
        'design', // UI·스타일 변경
        'style', // 포맷·세미콜론 등 코드 모양만 변경
        'docs', // 문서
        'test', // 테스트
        'chore', // 설정·의존성·빌드 등 기타
        'ci', // GitHub Actions 등 CI 설정
        'rename', // 파일·폴더 이름 변경
        'remove', // 파일·코드 삭제
        'revert', // 이전 커밋 되돌리기
      ],
    ],
    'subject-case': [0],
    'subject-max-length': [2, 'always', 72],
  },
}

export default config
