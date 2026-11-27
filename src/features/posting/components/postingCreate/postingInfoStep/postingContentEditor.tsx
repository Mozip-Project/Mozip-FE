'use client'

import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Fragment, type ComponentType, type SVGProps } from 'react'
import BoldIcon from '@/assets/icons/bold.svg'
import HeadingIcon from '@/assets/icons/heading.svg'
import ItalicIcon from '@/assets/icons/italic.svg'
import ListIcon from '@/assets/icons/list.svg'
import { cn } from '@/lib/utils'
import { ToolButton } from './toolButton'

const PLACEHOLDER = '내용을 입력해 주세요'

const EDITOR_EXTENSIONS = [
  StarterKit.configure({
    heading: { levels: [2] },
    blockquote: false,
    code: false,
    codeBlock: false,
    horizontalRule: false,
    link: false,
    orderedList: false,
    strike: false,
    underline: false,
    trailingNode: false,
  }),
]

const CONTENT_CLASS = cn(
  'min-h-full p-padding-m text-body2 font-normal break-words text-neutral-muted outline-none',
  '[&>*+*]:mt-2 [&_h2]:text-headline1 [&_h2]:font-semibold [&_h2]:text-neutral',
  '[&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-[1.5em]',
)

type EditorTool = {
  label: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  isActive: (editor: Editor) => boolean
  toggle: (editor: Editor) => void
  hasDividerBefore?: boolean
}

const EDITOR_TOOLS: EditorTool[] = [
  {
    label: '제목',
    Icon: HeadingIcon,
    isActive: (editor) => editor.isActive('heading', { level: 2 }),
    toggle: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    label: '굵게',
    Icon: BoldIcon,
    isActive: (editor) => editor.isActive('bold'),
    toggle: (editor) => editor.chain().focus().toggleBold().run(),
  },
  {
    label: '기울임',
    Icon: ItalicIcon,
    isActive: (editor) => editor.isActive('italic'),
    toggle: (editor) => editor.chain().focus().toggleItalic().run(),
  },
  {
    label: '목록',
    Icon: ListIcon,
    isActive: (editor) => editor.isActive('bulletList'),
    toggle: (editor) => editor.chain().focus().toggleBulletList().run(),
    hasDividerBefore: true,
  },
]

type PostingContentEditorProps = {
  value: string
  onChange: (html: string) => void
  labelledBy: string
}

function PostingContentEditor({ value, onChange, labelledBy }: PostingContentEditorProps) {
  const editor = useEditor({
    extensions: EDITOR_EXTENSIONS,
    content: value,
    // SSR 결과와 첫 렌더 불일치 방지
    immediatelyRender: false,
    editorProps: {
      attributes: {
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-labelledby': labelledBy,
        'aria-placeholder': PLACEHOLDER,
        class: CONTENT_CLASS,
      },
    },
    onUpdate: ({ editor: updatedEditor }) =>
      onChange(updatedEditor.isEmpty ? '' : updatedEditor.getHTML()),
  })
  const editorState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) =>
      currentEditor && {
        activeTools: EDITOR_TOOLS.map((tool) => tool.isActive(currentEditor)),
        // 글자 없는 목록·제목도 isEmpty라 빈 문단일 때만 placeholder 표시
        isBlankParagraph:
          currentEditor.isEmpty && currentEditor.state.doc.firstChild?.type.name === 'paragraph',
      },
  })
  const isPlaceholderVisible = editorState ? editorState.isBlankParagraph : value === ''

  return (
    <div className="flex h-63.25 flex-col overflow-hidden rounded-m border border-neutral-muted bg-layer-default transition-colors focus-within:border-neutral-weak motion-reduce:transition-none">
      <div
        role="toolbar"
        aria-label="서식"
        className="flex items-center gap-1 bg-neutral-weak px-2 py-1"
      >
        {EDITOR_TOOLS.map((tool, index) => (
          <Fragment key={tool.label}>
            {tool.hasDividerBefore && (
              <span aria-hidden className="h-4 w-px bg-(--border-color-neutral-weak)" />
            )}
            <ToolButton
              label={tool.label}
              isActive={editorState?.activeTools[index] ?? false}
              disabled={!editor}
              onClick={() => editor && tool.toggle(editor)}
            >
              <tool.Icon aria-hidden />
            </ToolButton>
          </Fragment>
        ))}
      </div>
      <div className="relative min-h-0 flex-1 overflow-y-auto">
        {isPlaceholderVisible && (
          <p
            aria-hidden
            className="pointer-events-none absolute top-padding-m left-padding-m text-body2 font-normal text-placeholder"
          >
            {PLACEHOLDER}
          </p>
        )}
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  )
}

export { PostingContentEditor }
