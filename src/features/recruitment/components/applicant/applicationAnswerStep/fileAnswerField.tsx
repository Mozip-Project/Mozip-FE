'use client'

import { useId, useState, type KeyboardEvent } from 'react'
import FileTextIcon from '@/assets/icons/fileText.svg'
import LinkIcon from '@/assets/icons/link.svg'
import PlusIcon from '@/assets/icons/plus.svg'
import { FileUpload } from '@/components/ui/FileUpload/fileUpload'
import type { FileAnswer } from '@/features/recruitment/schemas/applicationAnswerSchema'
import { formatFileSize, type FileRejection, type FileRule } from '@/utils/file'
import { AttachmentRow } from './attachmentRow'
import { LinkAnswerRow } from './linkAnswerRow'

type FileAnswerFieldProps = {
  value: FileAnswer
  onChange: (value: FileAnswer) => void
  acceptsFile: boolean
  acceptsLink: boolean
  fileRule: FileRule
  // 업로드 가능 형식 안내 문구
  fileTypeLabel: string
}

function getRejectionMessage(rejection: FileRejection, fileRule: FileRule, fileTypeLabel: string) {
  switch (rejection) {
    case 'oversized':
      return `${formatFileSize(fileRule.maxSizeBytes)}가 넘어 업로드하지 못했어요`
    case 'invalidType':
      return `${fileTypeLabel} 파일만 업로드 가능해요`
  }
}

function FileAnswerField({
  value,
  onChange,
  acceptsFile,
  acceptsLink,
  fileRule,
  fileTypeLabel,
}: FileAnswerFieldProps) {
  const linkInputId = useId()
  const [linkDraft, setLinkDraft] = useState('')

  // 먼저 올린 파일이 위에 오도록 끝에 추가, 규칙에 맞지 않는 파일도 오류 줄로 남김
  function addFile(file: File, rejection: FileRejection | null) {
    onChange({ ...value, files: [...value.files, { id: crypto.randomUUID(), file, rejection }] })
  }

  function handleFileRemove(id: string) {
    onChange({ ...value, files: value.files.filter((item) => item.id !== id) })
  }

  function handleLinkAdd() {
    const url = linkDraft.trim()

    if (!url) {
      return
    }
    onChange({ ...value, links: [...value.links, { id: crypto.randomUUID(), url }] })
    setLinkDraft('')
  }

  function handleLinkChange(id: string, url: string) {
    onChange({
      ...value,
      links: value.links.map((link) => (link.id === id ? { ...link, url } : link)),
    })
  }

  function handleLinkRemove(id: string) {
    onChange({ ...value, links: value.links.filter((item) => item.id !== id) })
  }

  // 적어 두고 [링크 추가]를 누르지 않은 링크 누락 방지, 다른 탭으로 복사하러 갈 때는 추가하지 않음
  function handleLinkBlur() {
    if (!document.hasFocus()) {
      return
    }
    handleLinkAdd()
  }

  function handleLinkKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    // 한글 조합 중 Enter는 조합 확정이라 추가하지 않음
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) {
      return
    }
    event.preventDefault()
    handleLinkAdd()
  }

  return (
    <>
      {acceptsFile && (
        <div className="flex flex-col gap-gap-s">
          <div className="flex items-center justify-between gap-gap-s">
            <p className="flex items-center gap-gap-xs text-label1 font-semibold text-neutral">
              <FileTextIcon aria-hidden className="size-4 shrink-0" />
              파일
            </p>
            <p className="text-caption1 font-medium text-neutral-subtle">
              {fileTypeLabel} 업로드 가능
            </p>
          </div>
          <FileUpload
            {...fileRule}
            description={`파일당 ${formatFileSize(fileRule.maxSizeBytes)} 이하`}
            onFileSelect={(file) => addFile(file, null)}
            onReject={(rejection, file) => addFile(file, rejection)}
          />
          {value.files.map(({ id, file, rejection }) =>
            rejection ? (
              <AttachmentRow
                key={id}
                name={file.name}
                status="error"
                errorMessage={getRejectionMessage(rejection, fileRule, fileTypeLabel)}
                onRemove={() => handleFileRemove(id)}
              />
            ) : (
              <AttachmentRow
                key={id}
                name={file.name}
                status="default"
                meta={formatFileSize(file.size)}
                onRemove={() => handleFileRemove(id)}
              />
            ),
          )}
        </div>
      )}
      {acceptsLink && (
        <div className="flex flex-col gap-gap-s">
          <label
            htmlFor={linkInputId}
            className="flex w-fit items-center gap-gap-xs text-label1 font-semibold text-neutral"
          >
            <LinkIcon aria-hidden className="size-4 shrink-0" />
            URL
          </label>
          {value.links.map(({ id, url }) => (
            <LinkAnswerRow
              key={id}
              url={url}
              onChange={(nextUrl) => handleLinkChange(id, nextUrl)}
              onRemove={() => handleLinkRemove(id)}
            />
          ))}
          <div className="flex flex-col items-start gap-gap-m">
            <div className="flex h-12 w-full items-center gap-gap-s rounded-m border border-neutral-muted bg-layer-default px-padding-m transition-colors focus-within:border-neutral-solid motion-reduce:transition-none">
              <LinkIcon aria-hidden className="size-5 shrink-0 text-neutral-subtle" />
              <input
                id={linkInputId}
                // type="url"은 폼 제출 시 브라우저 검증 창이 떠서 text + inputMode 사용
                type="text"
                inputMode="url"
                value={linkDraft}
                onChange={(event) => setLinkDraft(event.target.value)}
                onKeyDown={handleLinkKeyDown}
                onBlur={handleLinkBlur}
                placeholder="https:// 링크를 붙여 넣어 주세요"
                className="min-w-0 flex-1 bg-transparent text-body2 font-normal text-neutral outline-none placeholder:text-placeholder"
              />
            </div>
            <button
              type="button"
              onClick={handleLinkAdd}
              className="flex cursor-pointer items-center gap-1.5 rounded-xs text-label1 font-semibold text-neutral outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid"
            >
              <PlusIcon aria-hidden className="size-4 shrink-0" />
              링크 추가
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export { FileAnswerField }
