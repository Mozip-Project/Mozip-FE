# 서식 있는 글 입력은 Tiptap으로 만든다

- 상태: accepted
- 기록일: 2026-11-19

## 맥락

공고 작성 1단계의 "공고 내용"은 제목(h2)·굵게·기울임·글머리 목록 서식을 넣고, 선택한 글자의 서식에 맞춰 툴바 버튼이 active로 바뀌어야 합니다(Figma 3405:200725 annotation). 단순 textarea로는 서식을 담을 수 없습니다.

## 결정

- 서식 편집은 Tiptap v3(`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/pm`, `@tiptap/core`)을 사용합니다. 버전은 함께 고정합니다.
- StarterKit은 필요한 서식만 켭니다. 공고 내용은 제목 h2, 굵게, 기울임, 글머리 목록만 허용하고 나머지(인용, 코드, 링크, 번호 목록, 취소선, 밑줄, 자동 빈 문단)는 끕니다.
- 툴바·본문 모양은 Tiptap 기본 UI 없이 `tokens.css` 클래스로 직접 입힙니다. 툴바 버튼은 `ToolButton`을 사용합니다.
- 폼 값은 HTML 문자열로 저장하고, 빈 문서는 빈 문자열로 둡니다.
- Next.js SSR 불일치를 막기 위해 `immediatelyRender: false`로 만듭니다.

## 근거

- 선택 영역의 서식 상태(`isActive`)와 서식 토글 명령을 안정적으로 제공해, 드래그 시 툴바 표시 요구를 그대로 만족합니다.
- 헤드리스라 디자인 토큰으로 모양을 자유롭게 맞출 수 있습니다.

## 고려한 대안

- `contentEditable` + `document.execCommand`: 의존성은 없지만 execCommand가 표준에서 비권장이고, 브라우저마다 만드는 HTML이 달라 저장·표시가 불안정합니다.
- Lexical, Slate: 같은 일을 할 수 있지만 서식·선택 상태 처리를 더 직접 구현해야 합니다.

## 영향 범위

- `src/features/posting/components/postingCreate/postingContentEditor.tsx`
- 저장한 HTML을 지원자 화면 등에 표시할 때는 허용한 태그(h2, p, strong, em, ul, li)만 남기는 처리가 필요합니다. 표시 화면을 만들 때 함께 정합니다.
