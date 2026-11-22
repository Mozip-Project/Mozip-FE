import { useState, type ComponentProps } from 'react'
import { z } from 'zod'
import { resultNoticeMessageSchema } from '@/features/recruitment/schemas/resultNoticeMessageSchema'
import { MessageEditor } from './messageEditor'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'Features/Recruitment/ResultNotice/MessageEditor',
  component: MessageEditor,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof MessageEditor>

export default meta
// 필수 props를 render 안에서 직접 넘겨 args 타입 연결 제외
type Story = StoryObj

const PASS_SUBJECT = '14기 서류 전형 결과 안내'
const PASS_BODY = `{이름}님, UXUX 14기 서류 전형에 합격하셨습니다.
면접은 {면접 기간} 중 진행되며, 자세한 내용은 추후 안내드리겠습니다.

궁금한 점은 언제든 문의해 주세요.`

const FAIL_BODY = `{이름}님, UXUX 14기에 관심을 갖고 지원해 주셔서 감사합니다.
아쉽게도 이번 서류 전형에서는 함께하지 못하게 되었습니다.

다음 기회에 다시 만나길 바랍니다.`

type EditorPreviewProps = Pick<ComponentProps<typeof MessageEditor>, 'title' | 'variables'> & {
  initialSubject: string
  initialBody: string
  // 제출 실패 상태 확인용, 스키마 검사 결과를 오류 문구로 표시
  shouldValidate?: boolean
}

function EditorPreview({
  title,
  variables,
  initialSubject,
  initialBody,
  shouldValidate = false,
}: EditorPreviewProps) {
  const [subject, setSubject] = useState(initialSubject)
  const [body, setBody] = useState(initialBody)
  const result = resultNoticeMessageSchema.safeParse({ subject, body })
  const errors = shouldValidate && !result.success ? z.flattenError(result.error).fieldErrors : {}

  return (
    <div className="w-154">
      <MessageEditor
        title={title}
        subject={subject}
        body={body}
        variables={variables}
        onSubjectChange={setSubject}
        onBodyChange={setBody}
        onReset={() => {
          setSubject(initialSubject)
          setBody(initialBody)
        }}
        subjectError={errors.subject?.[0]}
        bodyError={errors.body?.[0]}
      />
    </div>
  )
}

export const Pass: Story = {
  render: () => (
    <EditorPreview
      title="합격 안내 메시지"
      variables={['이름', '포지션', '면접 기간', '면접 일시', '면접 장소']}
      initialSubject={PASS_SUBJECT}
      initialBody={PASS_BODY}
    />
  ),
}

export const Fail: Story = {
  render: () => (
    <EditorPreview
      title="불합격 안내 메시지"
      variables={['이름', '포지션']}
      initialSubject={PASS_SUBJECT}
      initialBody={FAIL_BODY}
    />
  ),
}

// Figma "빈 메시지 (제목·본문 입력 전)"
export const Empty: Story = {
  render: () => (
    <EditorPreview
      title="합격 안내 메시지"
      variables={['이름', '포지션', '면접 기간']}
      initialSubject=""
      initialBody=""
    />
  ),
}

export const RequiredError: Story = {
  render: () => (
    <EditorPreview
      title="불합격 안내 메시지"
      variables={['이름', '포지션']}
      initialSubject=""
      initialBody={FAIL_BODY}
      shouldValidate
    />
  ),
}

export const LongBody: Story = {
  render: () => (
    <EditorPreview
      title="합격 안내 메시지"
      variables={['이름', '포지션', '면접 기간']}
      initialSubject={PASS_SUBJECT}
      initialBody={Array.from({ length: 6 }, () => PASS_BODY).join('\n\n')}
    />
  ),
}
